import { prisma } from "@/lib/prisma";
import type { CreateServicoInput, UpdateServicoInput } from "./schema";

const ACTIVE = { isDeleted: false } as const;

export async function findAllServicos(tenantId: string, withDeleted = false) {
  return prisma.service.findMany({
    where: { tenantId, ...(withDeleted ? {} : ACTIVE) },
    orderBy: { createdAt: "desc" },
  });
}

export async function findServicoById(id: string, tenantId: string) {
  return prisma.service.findFirst({
    where: { id, tenantId, ...ACTIVE },
  });
}

export async function createServico(tenantId: string, data: CreateServicoInput) {
  return prisma.service.create({
    data: { ...data, tenantId, price: data.price },
  });
}

export async function updateServico(id: string, tenantId: string, data: UpdateServicoInput) {
  await prisma.service.findFirstOrThrow({ where: { id, tenantId, ...ACTIVE } });
  return prisma.service.update({ where: { id }, data });
}

/** Soft delete */
export async function deleteServico(id: string, tenantId: string) {
  await prisma.service.findFirstOrThrow({ where: { id, tenantId, ...ACTIVE } });
  return prisma.service.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
}

/** Restore soft-deleted record */
export async function restoreServico(id: string, tenantId: string) {
  await prisma.service.findFirstOrThrow({ where: { id, tenantId, isDeleted: true } });
  return prisma.service.update({
    where: { id },
    data: { isDeleted: false, deletedAt: null },
  });
}
