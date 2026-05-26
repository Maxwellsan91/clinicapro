import { prisma } from "@/lib/prisma";
import type { CreateServicoInput, UpdateServicoInput } from "./schema";

export async function findAllServicos(tenantId: string) {
  return prisma.service.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function findServicoById(id: string, tenantId: string) {
  return prisma.service.findFirst({
    where: { id, tenantId },
  });
}

export async function createServico(tenantId: string, data: CreateServicoInput) {
  return prisma.service.create({
    data: {
      ...data,
      tenantId,
      price: data.price,
    },
  });
}

export async function updateServico(id: string, tenantId: string, data: UpdateServicoInput) {
  await prisma.service.findFirstOrThrow({ where: { id, tenantId } });
  return prisma.service.update({
    where: { id },
    data,
  });
}

export async function deleteServico(id: string, tenantId: string) {
  await prisma.service.findFirstOrThrow({ where: { id, tenantId } });
  return prisma.service.delete({ where: { id } });
}

