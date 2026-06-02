"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TENANT_ID } from "@/constants";
import { getUser } from "@/features/auth/actions";
import { createAuditLog } from "@/lib/audit";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  status: string;
  clientId: string;
  clientName: string;
  collaboratorId: string;
  collaboratorName: string;
  serviceId: string;
  serviceName: string;
  notes: string | null;
  color: string;
  textColor: string;
}

export interface CalendarResource {
  id: string;
  name: string;
  email: string | null;
  role: string;
}

// Cores por status
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  scheduled: { bg: "#3b82f6", text: "#ffffff" },
  completed:  { bg: "#10b981", text: "#ffffff" },
  cancelled:  { bg: "#6b7280", text: "#ffffff" },
  no_show:    { bg: "#ef4444", text: "#ffffff" },
};

export async function getCalendarEvents(
  start: string,
  end: string,
  collaboratorId?: string
): Promise<CalendarEvent[]> {
  const appointments = await prisma.appointment.findMany({
    where: {
      tenantId: TENANT_ID,
      isDeleted: false,
      startDateTime: { gte: new Date(start), lte: new Date(end) },
      ...(collaboratorId ? { collaboratorId } : {}),
    },
    include: {
      client:       { select: { id: true, name: true } },
      collaborator: { select: { id: true, name: true } },
      service:      { select: { id: true, name: true } },
    },
    orderBy: { startDateTime: "asc" },
  });

  return appointments.map((apt) => {
    const colors = STATUS_COLORS[apt.status] ?? STATUS_COLORS.scheduled;
    return {
      id: apt.id,
      title: `${apt.client.name} — ${apt.service.name}`,
      start: apt.startDateTime.toISOString(),
      end:   apt.endDateTime.toISOString(),
      status: apt.status,
      clientId:        apt.clientId,
      clientName:      apt.client.name,
      collaboratorId:  apt.collaboratorId,
      collaboratorName: apt.collaborator.name,
      serviceId:   apt.serviceId,
      serviceName: apt.service.name,
      notes:     apt.notes,
      color:     colors.bg,
      textColor: colors.text,
    };
  });
}

export async function getCalendarResources(): Promise<CalendarResource[]> {
  return prisma.collaborator.findMany({
    where:   { tenantId: TENANT_ID, isDeleted: false },
    select:  { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });
}

export type MoveEventResult = { success: true } | { success: false; error: string };

export async function moveEventAction(
  id: string,
  newStart: string,
  newEnd: string
): Promise<MoveEventResult> {
  const apt = await prisma.appointment.findFirstOrThrow({
    where: { id, tenantId: TENANT_ID, isDeleted: false },
    include: { resources: { select: { resourceId: true } } },
  });

  // 1. Conflito de colaborador
  const collabOverlap = await prisma.appointment.findFirst({
    where: {
      tenantId: TENANT_ID,
      isDeleted: false,
      id: { not: id },
      collaboratorId: apt.collaboratorId,
      status: { notIn: ["cancelled", "no_show"] },
      startDateTime: { lt: new Date(newEnd) },
      endDateTime:   { gt: new Date(newStart) },
    },
    include: { client: { select: { name: true } } },
  });
  if (collabOverlap) {
    return { success: false, error: `O colaborador já tem um agendamento com ${collabOverlap.client.name} neste horário.` };
  }

  // 2. Conflito de recursos
  const resourceIds = apt.resources.map((r) => r.resourceId);
  if (resourceIds.length > 0) {
    const resOverlap = await prisma.appointmentResource.findFirst({
      where: {
        resourceId: { in: resourceIds },
        appointment: {
          tenantId:  TENANT_ID,
          isDeleted: false,
          id: { not: id },
          status: { notIn: ["cancelled", "no_show"] },
          startDateTime: { lt: new Date(newEnd) },
          endDateTime:   { gt: new Date(newStart) },
        },
      },
      include: { resource: { select: { name: true } } },
    });
    if (resOverlap) {
      return { success: false, error: `Conflito de horário: ${resOverlap.resource.name} já está reservado neste intervalo.` };
    }
  }

  await prisma.appointment.update({
    where: { id },
    data:  { startDateTime: new Date(newStart), endDateTime: new Date(newEnd) },
  });

  const user = await getUser();
  await createAuditLog({
    userId:    user?.id ?? "unknown",
    userEmail: user?.email,
    action:    "UPDATE",
    entity:    "Agendamento",
    entityId:  id,
    metadata:  { action: "drag_drop", newStart, newEnd },
  });

  revalidatePath("/agendamentos");
  return { success: true };
}

export async function updateEventStatusAction(
  id: string,
  status: string
): Promise<MoveEventResult> {
  await prisma.appointment.findFirstOrThrow({
    where: { id, tenantId: TENANT_ID, isDeleted: false },
  });

  await prisma.appointment.update({ where: { id }, data: { status } });

  const user = await getUser();
  await createAuditLog({
    userId:    user?.id ?? "unknown",
    userEmail: user?.email,
    action:    "STATUS_CHANGE",
    entity:    "Agendamento",
    entityId:  id,
    metadata:  { newStatus: status },
  });

  revalidatePath("/agendamentos");
  return { success: true };
}

export async function deleteEventAction(id: string): Promise<MoveEventResult> {
  await prisma.appointment.findFirstOrThrow({
    where: { id, tenantId: TENANT_ID, isDeleted: false },
  });
  await prisma.appointment.update({
    where: { id },
    data:  { isDeleted: true, deletedAt: new Date() },
  });

  const user = await getUser();
  await createAuditLog({
    userId:    user?.id ?? "unknown",
    userEmail: user?.email,
    action:    "DELETE",
    entity:    "Agendamento",
    entityId:  id,
  });

  revalidatePath("/agendamentos");
  return { success: true };
}

// ── Disponibilidade de recursos ───────────────────────────────────────────────

export interface ResourceAvailability {
  /** IDs dos recursos que estão ocupados no intervalo dado */
  occupiedIds: string[];
  /** Mapa resourceId → nome do cliente que o reservou */
  occupiedBy: Record<string, string>;
}

/**
 * Verifica quais recursos estão ocupados num determinado intervalo.
 * Usado no formulário de agendamento para bloquear visualmente as salas/equipamentos.
 */
export async function checkResourcesAvailabilityAction(
  start: string,
  end: string,
  excludeAppointmentId?: string,
): Promise<ResourceAvailability> {
  if (!start || !end) return { occupiedIds: [], occupiedBy: {} };

  const conflicts = await prisma.appointmentResource.findMany({
    where: {
      appointment: {
        tenantId:  TENANT_ID,
        isDeleted: false,
        status:    { notIn: ["cancelled", "no_show"] },
        ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
        startDateTime: { lt: new Date(end) },
        endDateTime:   { gt: new Date(start) },
      },
    },
    select: {
      resourceId:  true,
      appointment: { select: { client: { select: { name: true } } } },
    },
  });

  const occupiedIds: string[] = [];
  const occupiedBy: Record<string, string> = {};

  for (const c of conflicts) {
    if (!occupiedIds.includes(c.resourceId)) {
      occupiedIds.push(c.resourceId);
    }
    occupiedBy[c.resourceId] = c.appointment.client.name;
  }

  return { occupiedIds, occupiedBy };
}

export interface CheckOverlapResult {
  hasOverlap: boolean;
  conflictWith?: string;
}

export async function checkOverlapAction(
  collaboratorId: string,
  start: string,
  end: string,
  excludeId?: string
): Promise<CheckOverlapResult> {
  const overlap = await prisma.appointment.findFirst({
    where: {
      tenantId: TENANT_ID,
      isDeleted: false,
      collaboratorId,
      status: { notIn: ["cancelled", "no_show"] },
      ...(excludeId ? { id: { not: excludeId } } : {}),
      startDateTime: { lt: new Date(end) },
      endDateTime:   { gt: new Date(start) },
    },
    include: { client: { select: { name: true } } },
  });

  if (overlap) {
    return { hasOverlap: true, conflictWith: overlap.client.name };
  }
  return { hasOverlap: false };
}
