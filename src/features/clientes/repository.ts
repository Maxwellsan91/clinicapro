import { prisma } from "@/lib/prisma";
import type { CreateClienteInput, UpdateClienteInput } from "./schema";

export async function findAllClientes(tenantId: string) {
  return prisma.client.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function findClienteById(id: string, tenantId: string) {
  return prisma.client.findFirst({
    where: { id, tenantId },
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

export async function deleteCliente(id: string, tenantId: string) {
  // Ensure it belongs to the tenant
  await prisma.client.findFirstOrThrow({ where: { id, tenantId } });
  return prisma.client.delete({ where: { id } });
}

