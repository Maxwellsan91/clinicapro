import { prisma } from "@/lib/prisma";
import type { CreateColaboradorInput, UpdateColaboradorInput } from "./schema";

const ACTIVE = { isDeleted: false } as const;

export async function findAllColaboradores(tenantId: string, withDeleted = false) {
  return prisma.collaborator.findMany({
    where: { tenantId, ...(withDeleted ? {} : ACTIVE) },
    orderBy: { createdAt: "desc" },
  });
}

export async function findColaboradorById(id: string, tenantId: string) {
  return prisma.collaborator.findFirst({
    where: { id, tenantId, ...ACTIVE },
  });
}

export async function createColaborador(tenantId: string, data: CreateColaboradorInput) {
  return prisma.collaborator.create({
    data: {
      ...data,
      tenantId,
      email: data.email || null,
      commissionRate: data.commissionRate ?? null,
    },
  });
}

export async function updateColaborador(id: string, tenantId: string, data: UpdateColaboradorInput) {
  await prisma.collaborator.findFirstOrThrow({ where: { id, tenantId, ...ACTIVE } });
  return prisma.collaborator.update({
    where: { id },
    data: {
      ...data,
      email: data.email !== undefined ? (data.email || null) : undefined,
      commissionRate: data.commissionRate !== undefined ? data.commissionRate : undefined,
    },
  });
}

/** Soft delete */
export async function deleteColaborador(id: string, tenantId: string) {
  await prisma.collaborator.findFirstOrThrow({ where: { id, tenantId, ...ACTIVE } });
  return prisma.collaborator.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
}

/** Restore soft-deleted record */
export async function restoreColaborador(id: string, tenantId: string) {
  await prisma.collaborator.findFirstOrThrow({ where: { id, tenantId, isDeleted: true } });
  return prisma.collaborator.update({
    where: { id },
    data: { isDeleted: false, deletedAt: null },
  });
}

/** Returns collaborators with their earned commissions based on completed payments */
export async function getColaboradoresComissoes(tenantId: string) {
  const colaboradores = await prisma.collaborator.findMany({
    where: { tenantId, ...ACTIVE },
    include: {
      appointments: {
        where: { tenantId, status: "completed", isDeleted: false },
        include: {
          payments: {
            where: { status: "paid", isDeleted: false },
            select: { amount: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return colaboradores.map((col) => {
    const totalPagamentos = col.appointments.reduce((sum, apt) => {
      const aptTotal = apt.payments.reduce((s, p) => s + Number(p.amount), 0);
      return sum + aptTotal;
    }, 0);
    const commissionRate = Number(col.commissionRate ?? 0);
    const commissionValue = (totalPagamentos * commissionRate) / 100;
    return {
      id: col.id,
      name: col.name,
      role: col.role,
      email: col.email,
      commissionRate,
      totalPagamentos,
      commissionValue,
      appointmentsCompleted: col.appointments.length,
    };
  });
}
