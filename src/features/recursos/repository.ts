import { prisma } from "@/lib/prisma";
import type { CreateRecursoInput, UpdateRecursoInput } from "./schema";

const ACTIVE = { isDeleted: false } as const;

export async function findAllRecursos(tenantId: string, withDeleted = false) {
  return prisma.resource.findMany({
    where: { tenantId, ...(withDeleted ? {} : ACTIVE) },
    orderBy: { createdAt: "desc" },
  });
}

export async function findRecursoById(id: string, tenantId: string) {
  return prisma.resource.findFirst({
    where: { id, tenantId, ...ACTIVE },
  });
}

export async function findActiveRecursos(tenantId: string) {
  return prisma.resource.findMany({
    where: { tenantId, isActive: true, ...ACTIVE },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
}

export async function createRecurso(tenantId: string, data: CreateRecursoInput) {
  return prisma.resource.create({
    data: { ...data, tenantId },
  });
}

export async function updateRecurso(id: string, tenantId: string, data: UpdateRecursoInput) {
  await prisma.resource.findFirstOrThrow({ where: { id, tenantId, ...ACTIVE } });
  return prisma.resource.update({ where: { id }, data });
}

/** Soft delete */
export async function deleteRecurso(id: string, tenantId: string) {
  await prisma.resource.findFirstOrThrow({ where: { id, tenantId, ...ACTIVE } });
  return prisma.resource.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
}

/** Restore soft-deleted record */
export async function restoreRecurso(id: string, tenantId: string) {
  await prisma.resource.findFirstOrThrow({ where: { id, tenantId, isDeleted: true } });
  return prisma.resource.update({
    where: { id },
    data: { isDeleted: false, deletedAt: null },
  });
}

/**
 * Verifica conflitos de um recurso num determinado intervalo de tempo.
 * Retorna os agendamentos que colidem.
 */
export async function checkResourceConflicts(
  tenantId: string,
  resourceIds: string[],
  startDateTime: Date,
  endDateTime: Date,
  excludeAppointmentId?: string,
) {
  if (resourceIds.length === 0) return [];

  return prisma.appointmentResource.findMany({
    where: {
      resourceId: { in: resourceIds },
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

