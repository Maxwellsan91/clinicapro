import { prisma } from "@/lib/prisma";
import type { CreateColaboradorInput, UpdateColaboradorInput } from "./schema";

export async function findAllColaboradores(tenantId: string) {
  return prisma.collaborator.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function findColaboradorById(id: string, tenantId: string) {
  return prisma.collaborator.findFirst({
    where: { id, tenantId },
  });
}

export async function createColaborador(tenantId: string, data: CreateColaboradorInput) {
  return prisma.collaborator.create({
    data: {
      ...data,
      tenantId,
      email: data.email || null,
    },
  });
}

export async function updateColaborador(id: string, tenantId: string, data: UpdateColaboradorInput) {
  await prisma.collaborator.findFirstOrThrow({ where: { id, tenantId } });
  return prisma.collaborator.update({
    where: { id },
    data: { ...data, email: data.email || null },
  });
}

export async function deleteColaborador(id: string, tenantId: string) {
  await prisma.collaborator.findFirstOrThrow({ where: { id, tenantId } });
  return prisma.collaborator.delete({ where: { id } });
}

