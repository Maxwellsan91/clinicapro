"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TENANT_ID } from "@/constants";
import { getUser } from "@/features/auth/actions";
import { createAuditLog } from "@/lib/audit";
import {
  assertValidAppointmentInterval,
  checkCollaboratorConflict,
  ensurePaymentForFinalizedAppointment,
  checkResourceConflicts,
} from "./repository";

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

  const startDateTime = new Date(newStart);
  const endDateTime = new Date(newEnd);

  try {
    assertValidAppointmentInterval(startDateTime, endDateTime);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Horário inválido." };
  }

  // 1. Conflito de colaborador
  const collabOverlap = await checkCollaboratorConflict({
    tenantId: TENANT_ID,
    collaboratorId: apt.collaboratorId,
    startDateTime,
    endDateTime,
    excludeAppointmentId: id,
  });
  if (collabOverlap) {
    return { success: false, error: `O colaborador já tem um agendamento com ${collabOverlap.client.name} neste horário.` };
  }

  // 2. Conflito de recursos
  const resourceIds = apt.resources.map((r) => r.resourceId);
  if (resourceIds.length > 0) {
    const resourceConflicts = await checkResourceConflicts({
      tenantId: TENANT_ID,
      resourceIds,
      startDateTime,
      endDateTime,
      excludeAppointmentId: id,
    });
    if (resourceConflicts.length > 0) {
      const firstConflict = resourceConflicts[0];
      const firstAppointment = firstConflict.appointments[0];
      return {
        success: false,
        error: firstAppointment
          ? `${firstConflict.resourceName} já está reservada entre ${firstAppointment.timeRange}.`
          : `${firstConflict.resourceName} já está reservada neste horário.`,
      };
    }
  }

  await prisma.appointment.update({
    where: { id },
    data:  { startDateTime, endDateTime },
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
  await ensurePaymentForFinalizedAppointment(TENANT_ID, id);

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
  revalidatePath("/pagamentos");
  revalidatePath("/financeiro");
  revalidatePath("/financeiro/resumo-anual");
  revalidatePath("/comissoes");
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
  /** Mapa resourceId → intervalo ocupado formatado */
  occupiedTimeRange: Record<string, string>;
  /** Mapa resourceId → colaborador/profissional associado */
  occupiedCollaborator: Record<string, string>;
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
  if (!start || !end) {
    return { occupiedIds: [], occupiedBy: {}, occupiedTimeRange: {}, occupiedCollaborator: {} };
  }

  const startDateTime = new Date(start);
  const endDateTime = new Date(end);
  try {
    assertValidAppointmentInterval(startDateTime, endDateTime);
  } catch {
    return { occupiedIds: [], occupiedBy: {}, occupiedTimeRange: {}, occupiedCollaborator: {} };
  }

  const activeResources = await prisma.resource.findMany({
    where: { tenantId: TENANT_ID, isDeleted: false, isActive: true },
    select: { id: true },
  });

  const conflicts = await checkResourceConflicts({
    tenantId: TENANT_ID,
    resourceIds: activeResources.map((resource) => resource.id),
    startDateTime,
    endDateTime,
    excludeAppointmentId,
  });

  const occupiedIds: string[] = [];
  const occupiedBy: Record<string, string> = {};
  const occupiedTimeRange: Record<string, string> = {};
  const occupiedCollaborator: Record<string, string> = {};

  for (const conflict of conflicts) {
    if (!occupiedIds.includes(conflict.resourceId)) {
      occupiedIds.push(conflict.resourceId);
    }
    const firstAppointment = conflict.appointments[0];
    if (firstAppointment) {
      occupiedBy[conflict.resourceId] = firstAppointment.clientName;
      occupiedTimeRange[conflict.resourceId] = firstAppointment.timeRange;
      occupiedCollaborator[conflict.resourceId] = firstAppointment.collaboratorName;
    }
  }

  return { occupiedIds, occupiedBy, occupiedTimeRange, occupiedCollaborator };
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
  const overlap = await checkCollaboratorConflict({
    tenantId: TENANT_ID,
    collaboratorId,
    startDateTime: new Date(start),
    endDateTime: new Date(end),
    excludeAppointmentId: excludeId,
  });

  if (overlap) {
    return { hasOverlap: true, conflictWith: overlap.client.name };
  }
  return { hasOverlap: false };
}
