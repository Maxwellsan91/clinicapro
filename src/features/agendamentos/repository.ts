import { prisma } from "@/lib/prisma";
import type { CreateAgendamentoInput, UpdateAgendamentoInput } from "./schema";

const includeRelations = {
  client: { select: { id: true, name: true, phone: true } },
  collaborator: { select: { id: true, name: true, role: true } },
  service: { select: { id: true, name: true, duration: true, price: true } },
} as const;

export async function findAllAgendamentos(tenantId: string) {
  return prisma.appointment.findMany({
    where: { tenantId },
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
    where: {
      tenantId,
      startDateTime: { gte: start, lte: end },
    },
    include: includeRelations,
    orderBy: { startDateTime: "asc" },
  });
}

export async function findAgendamentoById(id: string, tenantId: string) {
  return prisma.appointment.findFirst({
    where: { id, tenantId },
    include: includeRelations,
  });
}

export async function createAgendamento(
  tenantId: string,
  data: CreateAgendamentoInput
) {
  return prisma.appointment.create({
    data: {
      tenantId,
      clientId: data.clientId,
      collaboratorId: data.collaboratorId,
      serviceId: data.serviceId,
      startDateTime: new Date(data.startDateTime),
      endDateTime: new Date(data.endDateTime),
      status: data.status ?? "scheduled",
      notes: data.notes || null,
    },
    include: includeRelations,
  });
}

export async function updateAgendamento(
  id: string,
  tenantId: string,
  data: UpdateAgendamentoInput
) {
  await prisma.appointment.findFirstOrThrow({ where: { id, tenantId } });
  return prisma.appointment.update({
    where: { id },
    data: {
      ...(data.clientId && { clientId: data.clientId }),
      ...(data.collaboratorId && { collaboratorId: data.collaboratorId }),
      ...(data.serviceId && { serviceId: data.serviceId }),
      ...(data.startDateTime && { startDateTime: new Date(data.startDateTime) }),
      ...(data.endDateTime && { endDateTime: new Date(data.endDateTime) }),
      ...(data.status && { status: data.status }),
      notes: data.notes ?? undefined,
    },
    include: includeRelations,
  });
}

export async function cancelAgendamento(id: string, tenantId: string) {
  await prisma.appointment.findFirstOrThrow({ where: { id, tenantId } });
  return prisma.appointment.update({
    where: { id },
    data: { status: "cancelled" },
  });
}

export async function deleteAgendamento(id: string, tenantId: string) {
  await prisma.appointment.findFirstOrThrow({ where: { id, tenantId } });
  return prisma.appointment.delete({ where: { id } });
}
