import { prisma } from "@/lib/prisma";
import type { CreateClienteInput, UpdateClienteInput } from "./schema";

const ACTIVE = { isDeleted: false } as const;

export async function findAllClientes(tenantId: string, withDeleted = false) {
  return prisma.client.findMany({
    where: { tenantId, ...(withDeleted ? {} : ACTIVE) },
    orderBy: { createdAt: "desc" },
  });
}

export async function findClienteById(id: string, tenantId: string) {
  return prisma.client.findFirst({
    where: { id, tenantId, ...ACTIVE },
  });
}

export async function findClienteByIdWithDetails(id: string, tenantId: string) {
  return prisma.client.findFirst({
    where: { id, tenantId, ...ACTIVE },
    include: {
      appointments: {
        where: { isDeleted: false },
        orderBy: { startDateTime: "desc" },
        include: {
          service: { select: { name: true, price: true } },
          collaborator: { select: { name: true } },
        },
      },
      payments: {
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function createCliente(tenantId: string, data: CreateClienteInput) {
  return prisma.client.create({
    data: {
      ...data,
      tenantId,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      email: data.email || null,
    },
  });
}

export async function updateCliente(id: string, tenantId: string, data: UpdateClienteInput) {
  return prisma.client.update({
    where: { id },
    data: {
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      email: data.email || null,
    },
  });
}

/** Soft delete */
export async function deleteCliente(id: string, tenantId: string) {
  await prisma.client.findFirstOrThrow({ where: { id, tenantId, ...ACTIVE } });
  return prisma.client.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
}

/** Restore soft-deleted record */
export async function restoreCliente(id: string, tenantId: string) {
  await prisma.client.findFirstOrThrow({ where: { id, tenantId, isDeleted: true } });
  return prisma.client.update({
    where: { id },
    data: { isDeleted: false, deletedAt: null },
  });
}
