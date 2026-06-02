import { prisma } from "@/lib/prisma";
import type { CreateAgendamentoInput, UpdateAgendamentoInput } from "./schema";

const ACTIVE = { isDeleted: false } as const;

const includeRelations = {
  client:       { select: { id: true, name: true, phone: true } },
  collaborator: { select: { id: true, name: true, role: true } },
  service:      { select: { id: true, name: true, duration: true, price: true } },
  resources: {
    include: {
      resource: { select: { id: true, name: true, type: true } },
    },
  },
} as const;

export async function findAllAgendamentos(tenantId: string, withDeleted = false) {
  return prisma.appointment.findMany({
    where: { tenantId, ...(withDeleted ? {} : ACTIVE) },
    include: includeRelations,
    orderBy: { startDateTime: "desc" },
  });
}

export async function findAgendamentosByDate(tenantId: string, date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return prisma.appointment.findMany({
    where: { tenantId, startDateTime: { gte: start, lte: end }, ...ACTIVE },
    include: includeRelations,
    orderBy: { startDateTime: "asc" },
  });
}

export async function findAgendamentoById(id: string, tenantId: string) {
  return prisma.appointment.findFirst({
    where: { id, tenantId, ...ACTIVE },
    include: includeRelations,
  });
}

// ── Conflict helpers ──────────────────────────────────────────────────────────

/** Verifica sobreposição de horário do colaborador */
export async function checkCollaboratorConflict(
  tenantId: string,
  collaboratorId: string,
  startDateTime: Date,
  endDateTime: Date,
  excludeId?: string,
) {
  return prisma.appointment.findFirst({
    where: {
      tenantId,
      isDeleted: false,
      collaboratorId,
      status: { notIn: ["cancelled", "no_show"] },
      ...(excludeId ? { id: { not: excludeId } } : {}),
      startDateTime: { lt: endDateTime },
      endDateTime:   { gt: startDateTime },
    },
    include: { client: { select: { name: true } } },
  });
}

/** Verifica sobreposição de recursos */
export async function checkResourcesConflict(
  tenantId: string,
  resourceIds: string[],
  startDateTime: Date,
  endDateTime: Date,
  excludeId?: string,
) {
  if (resourceIds.length === 0) return [];

  return prisma.appointmentResource.findMany({
    where: {
      resourceId: { in: resourceIds },
      appointment: {
        tenantId,
        isDeleted: false,
        status: { notIn: ["cancelled", "no_show"] },
        ...(excludeId ? { id: { not: excludeId } } : {}),
        startDateTime: { lt: endDateTime },
        endDateTime:   { gt: startDateTime },
      },
    },
    include: {
      resource:    { select: { id: true, name: true } },
      appointment: {
        select: {
          id: true,
          startDateTime: true,
          endDateTime: true,
          client: { select: { name: true } },
        },
      },
    },
  });
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

export async function createAgendamento(
  tenantId: string,
  data: CreateAgendamentoInput,
) {
  const resourceIds = data.resourceIds ?? [];

  return prisma.appointment.create({
    data: {
      tenantId,
      clientId:       data.clientId,
      collaboratorId: data.collaboratorId,
      serviceId:      data.serviceId,
      startDateTime:  new Date(data.startDateTime),
      endDateTime:    new Date(data.endDateTime),
      status:         data.status ?? "scheduled",
      notes:          data.notes || null,
      resources: resourceIds.length > 0
        ? { create: resourceIds.map((resourceId) => ({ resourceId })) }
        : undefined,
    },
    include: includeRelations,
  });
}

export async function updateAgendamento(
  id: string,
  tenantId: string,
  data: UpdateAgendamentoInput,
) {
  await prisma.appointment.findFirstOrThrow({ where: { id, tenantId, ...ACTIVE } });

  const resourceIds = data.resourceIds;

  return prisma.$transaction(async (tx) => {
    if (resourceIds !== undefined) {
      await tx.appointmentResource.deleteMany({ where: { appointmentId: id } });
      if (resourceIds.length > 0) {
        await tx.appointmentResource.createMany({
          data: resourceIds.map((resourceId) => ({ appointmentId: id, resourceId })),
          skipDuplicates: true,
        });
      }
    }

    return tx.appointment.update({
      where: { id },
      data: {
        ...(data.clientId       && { clientId: data.clientId }),
        ...(data.collaboratorId && { collaboratorId: data.collaboratorId }),
        ...(data.serviceId      && { serviceId: data.serviceId }),
        ...(data.startDateTime  && { startDateTime: new Date(data.startDateTime) }),
        ...(data.endDateTime    && { endDateTime: new Date(data.endDateTime) }),
        ...(data.status         && { status: data.status }),
        notes: data.notes ?? undefined,
      },
      include: includeRelations,
    });
  });
}

export async function cancelAgendamento(id: string, tenantId: string) {
  await prisma.appointment.findFirstOrThrow({ where: { id, tenantId, ...ACTIVE } });
  return prisma.appointment.update({ where: { id }, data: { status: "cancelled" } });
}

/** Soft delete */
export async function deleteAgendamento(id: string, tenantId: string) {
  await prisma.appointment.findFirstOrThrow({ where: { id, tenantId, ...ACTIVE } });
  return prisma.appointment.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
}

/** Restore soft-deleted record */
export async function restoreAgendamento(id: string, tenantId: string) {
  await prisma.appointment.findFirstOrThrow({ where: { id, tenantId, isDeleted: true } });
  return prisma.appointment.update({
    where: { id },
    data: { isDeleted: false, deletedAt: null },
  });
}
