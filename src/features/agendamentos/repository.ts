import { prisma } from "@/lib/prisma";
import type { CreateAgendamentoInput, UpdateAgendamentoInput } from "./schema";
import { formatTimeRange, hasTimeOverlap } from "./timeOverlap";

const ACTIVE = { isDeleted: false } as const;

const includeRelations = {
  client:       { select: { id: true, name: true, phone: true } },
  collaborator: { select: { id: true, name: true, role: true } },
  service:      { select: { id: true, name: true, duration: true, price: true } },
  resources: {
    include: {
      resource: { select: { id: true, name: true, type: true, capacity: true } },
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

export function assertValidAppointmentInterval(startDateTime: Date, endDateTime: Date) {
  if (
    Number.isNaN(startDateTime.getTime()) ||
    Number.isNaN(endDateTime.getTime()) ||
    startDateTime >= endDateTime
  ) {
    throw new Error("O horário de término deve ser posterior ao horário de início.");
  }
}

export interface ConflictCheckInput {
  tenantId: string;
  startDateTime: Date;
  endDateTime: Date;
  excludeAppointmentId?: string;
}

export interface ResourceConflictCheckInput extends ConflictCheckInput {
  resourceIds: string[];
}

export interface CollaboratorConflictCheckInput extends ConflictCheckInput {
  collaboratorId: string;
}

export interface ResourceConflict {
  resourceId: string;
  resourceName: string;
  capacity: number;
  overlappingCount: number;
  appointments: {
    id: string;
    clientName: string;
    collaboratorName: string;
    startDateTime: Date;
    endDateTime: Date;
    timeRange: string;
  }[];
}

/** Verifica sobreposição de horário do colaborador */
export async function checkCollaboratorConflict({
  tenantId,
  collaboratorId,
  startDateTime,
  endDateTime,
  excludeAppointmentId,
}: CollaboratorConflictCheckInput) {
  assertValidAppointmentInterval(startDateTime, endDateTime);
  return prisma.appointment.findFirst({
    where: {
      tenantId,
      isDeleted: false,
      collaboratorId,
      status: { notIn: ["cancelled", "no_show"] },
      ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
      startDateTime: { lt: endDateTime },
      endDateTime:   { gt: startDateTime },
    },
    include: { client: { select: { name: true } } },
  });
}

/** Verifica sobreposição de recursos */
export async function checkResourceConflicts({
  tenantId,
  resourceIds,
  startDateTime,
  endDateTime,
  excludeAppointmentId,
}: ResourceConflictCheckInput): Promise<ResourceConflict[]> {
  if (resourceIds.length === 0) return [];
  assertValidAppointmentInterval(startDateTime, endDateTime);

  const uniqueResourceIds = [...new Set(resourceIds)];
  const resourceRows = await prisma.resource.findMany({
    where: { tenantId, id: { in: uniqueResourceIds }, isDeleted: false, isActive: true },
    select: { id: true, name: true, capacity: true },
  });
  const resourcesById = new Map(resourceRows.map((resource) => [resource.id, resource]));

  const overlappingReservations = await prisma.appointmentResource.findMany({
    where: {
      resourceId: { in: uniqueResourceIds },
      appointment: {
        tenantId,
        isDeleted: false,
        status: { notIn: ["cancelled", "no_show"] },
        ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
        startDateTime: { lt: endDateTime },
        endDateTime:   { gt: startDateTime },
      },
    },
    include: {
      resource:    { select: { id: true, name: true, capacity: true } },
      appointment: {
        select: {
          id: true,
          startDateTime: true,
          endDateTime: true,
          client: { select: { name: true } },
          collaborator: { select: { name: true } },
        },
      },
    },
  });

  const grouped = new Map<string, ResourceConflict>();

  for (const reservation of overlappingReservations) {
    if (!hasTimeOverlap(
      reservation.appointment.startDateTime,
      reservation.appointment.endDateTime,
      startDateTime,
      endDateTime
    )) {
      continue;
    }

    const resource = resourcesById.get(reservation.resourceId) ?? reservation.resource;
    const current = grouped.get(reservation.resourceId) ?? {
      resourceId: reservation.resourceId,
      resourceName: resource.name,
      capacity: resource.capacity,
      overlappingCount: 0,
      appointments: [],
    };

    current.overlappingCount += 1;
    current.appointments.push({
      id: reservation.appointment.id,
      clientName: reservation.appointment.client.name,
      collaboratorName: reservation.appointment.collaborator.name,
      startDateTime: reservation.appointment.startDateTime,
      endDateTime: reservation.appointment.endDateTime,
      timeRange: formatTimeRange(
        reservation.appointment.startDateTime,
        reservation.appointment.endDateTime
      ),
    });
    grouped.set(reservation.resourceId, current);
  }

  return [...grouped.values()].filter((conflict) =>
    conflict.capacity <= 1 || conflict.overlappingCount >= conflict.capacity
  );
}

export async function ensurePaymentForFinalizedAppointment(
  tenantId: string,
  appointmentId: string
) {
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, tenantId, isDeleted: false },
    include: {
      service: { select: { price: true, name: true } },
      payments: {
        where: { isDeleted: false },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!appointment) return null;
  if (!["completed", "cancelled"].includes(appointment.status)) return null;
  if (appointment.payments.length > 0) return appointment.payments[0];

  const status = appointment.status === "cancelled" ? "cancelled" : "pending";

  return prisma.payment.create({
    data: {
      tenantId,
      clientId: appointment.clientId,
      appointmentId: appointment.id,
      amount: appointment.service.price,
      status,
      dueDate: appointment.startDateTime,
      paidAt: null,
      invoiceStatus: "not_issued",
      notes:
        status === "cancelled"
          ? "Pagamento gerado automaticamente a partir de agendamento cancelado."
          : "Pagamento pendente gerado automaticamente ao concluir o atendimento.",
    },
  });
}

export async function syncMissingPaymentsForFinalizedAppointments(tenantId: string) {
  const appointments = await prisma.appointment.findMany({
    where: {
      tenantId,
      isDeleted: false,
      status: { in: ["completed", "cancelled"] },
      payments: { none: { isDeleted: false } },
    },
    select: { id: true },
  });

  const synced = await Promise.all(
    appointments.map((appointment) =>
      ensurePaymentForFinalizedAppointment(tenantId, appointment.id)
    )
  );

  return synced.filter(Boolean).length;
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
