import { prisma } from "@/lib/prisma";
import type { CreatePagamentoInput, UpdatePagamentoInput } from "./schema";

const includeRelations = {
  client: { select: { id: true, name: true, email: true, phone: true } },
  appointment: {
    select: {
      id: true,
      startDateTime: true,
      service: { select: { id: true, name: true } },
    },
  },
} as const;

export async function findAllPagamentos(tenantId: string) {
  return prisma.payment.findMany({
    where: { tenantId },
    include: includeRelations,
    orderBy: { createdAt: "desc" },
  });
}

export async function findPagamentoById(id: string, tenantId: string) {
  return prisma.payment.findFirst({
    where: { id, tenantId },
    include: includeRelations,
  });
}

export async function findPagamentosByClient(
  tenantId: string,
  clientId: string
) {
  return prisma.payment.findMany({
    where: { tenantId, clientId },
    include: includeRelations,
    orderBy: { createdAt: "desc" },
  });
}

export async function createPagamento(
  tenantId: string,
  data: CreatePagamentoInput
) {
  return prisma.payment.create({
    data: {
      tenantId,
      clientId: data.clientId,
      appointmentId: data.appointmentId || null,
      amount: data.amount,
      paymentMethod: data.paymentMethod || null,
      status: data.status ?? "pending",
      paidAt: data.paidAt ? new Date(data.paidAt) : null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      notes: data.notes || null,
      invoiceStatus: data.invoiceStatus ?? "not_issued",
      invoiceNumber: data.invoiceNumber || null,
      invoiceExternalUrl: data.invoiceExternalUrl || null,
    },
    include: includeRelations,
  });
}

export async function updatePagamento(
  id: string,
  tenantId: string,
  data: UpdatePagamentoInput
) {
  await prisma.payment.findFirstOrThrow({ where: { id, tenantId } });
  return prisma.payment.update({
    where: { id },
    data: {
      ...(data.clientId && { clientId: data.clientId }),
      appointmentId:
        data.appointmentId !== undefined
          ? data.appointmentId || null
          : undefined,
      ...(data.amount !== undefined && { amount: data.amount }),
      paymentMethod:
        data.paymentMethod !== undefined
          ? data.paymentMethod || null
          : undefined,
      ...(data.status && { status: data.status }),
      paidAt:
        data.paidAt !== undefined
          ? data.paidAt
            ? new Date(data.paidAt)
            : null
          : undefined,
      dueDate:
        data.dueDate !== undefined
          ? data.dueDate
            ? new Date(data.dueDate)
            : null
          : undefined,
      notes: data.notes !== undefined ? data.notes || null : undefined,
      ...(data.invoiceStatus && { invoiceStatus: data.invoiceStatus }),
      invoiceNumber:
        data.invoiceNumber !== undefined
          ? data.invoiceNumber || null
          : undefined,
      invoiceExternalUrl:
        data.invoiceExternalUrl !== undefined
          ? data.invoiceExternalUrl || null
          : undefined,
    },
    include: includeRelations,
  });
}

export async function markAsPaid(id: string, tenantId: string) {
  await prisma.payment.findFirstOrThrow({ where: { id, tenantId } });
  return prisma.payment.update({
    where: { id },
    data: { status: "paid", paidAt: new Date() },
  });
}

export async function markAsPending(id: string, tenantId: string) {
  await prisma.payment.findFirstOrThrow({ where: { id, tenantId } });
  return prisma.payment.update({
    where: { id },
    data: { status: "pending", paidAt: null },
  });
}

export async function deletePagamento(id: string, tenantId: string) {
  await prisma.payment.findFirstOrThrow({ where: { id, tenantId } });
  return prisma.payment.delete({ where: { id } });
}

export async function getPagamentosStats(tenantId: string) {
  const [total, paid, pending, partial] = await Promise.all([
    prisma.payment.aggregate({
      where: { tenantId },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: { tenantId, status: "paid" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: { tenantId, status: "pending" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: { tenantId, status: "partial" },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  return { total, paid, pending, partial };
}

