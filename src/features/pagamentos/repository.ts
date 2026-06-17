import { prisma } from "@/lib/prisma";
import type { CreatePagamentoInput, UpdatePagamentoInput } from "./schema";

const ACTIVE = { isDeleted: false } as const;

const includeRelations = {
  client: { select: { id: true, name: true, email: true, phone: true } },
  appointment: {
    select: {
      id: true,
      startDateTime: true,
      endDateTime: true,
      service: { select: { id: true, name: true, duration: true, price: true } },
    },
  },
} as const;

export async function findAllPagamentos(tenantId: string, withDeleted = false) {
  return prisma.payment.findMany({
    where: { tenantId, ...(withDeleted ? {} : ACTIVE) },
    include: includeRelations,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function findPagamentoById(id: string, tenantId: string) {
  return prisma.payment.findFirst({
    where: { id, tenantId, ...ACTIVE },
    include: includeRelations,
  });
}

export async function findPagamentosByClient(
  tenantId: string,
  clientId: string
) {
  return prisma.payment.findMany({
    where: { tenantId, clientId, ...ACTIVE },
    include: includeRelations,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
}

function resolvePaidAt(status: string | undefined, paidAt: string | undefined) {
  if (paidAt) return new Date(paidAt);
  if (status === "paid") return new Date();
  return null;
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
      paidAt: resolvePaidAt(data.status, data.paidAt),
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
  const current = await prisma.payment.findFirstOrThrow({ where: { id, tenantId, ...ACTIVE } });
  const nextStatus = data.status ?? current.status;
  const nextPaidAt =
    data.paidAt !== undefined
      ? (data.paidAt ? new Date(data.paidAt) : nextStatus === "paid" ? new Date() : null)
      : nextStatus === "paid" && !current.paidAt
        ? new Date()
        : undefined;

  return prisma.payment.update({
    where: { id },
    data: {
      ...(data.clientId && { clientId: data.clientId }),
      appointmentId: data.appointmentId !== undefined ? data.appointmentId || null : undefined,
      ...(data.amount !== undefined && { amount: data.amount }),
      paymentMethod: data.paymentMethod !== undefined ? data.paymentMethod || null : undefined,
      ...(data.status && { status: data.status }),
      paidAt: nextPaidAt,
      dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
      notes: data.notes !== undefined ? data.notes || null : undefined,
      ...(data.invoiceStatus && { invoiceStatus: data.invoiceStatus }),
      invoiceNumber: data.invoiceNumber !== undefined ? data.invoiceNumber || null : undefined,
      invoiceExternalUrl: data.invoiceExternalUrl !== undefined ? data.invoiceExternalUrl || null : undefined,
    },
    include: includeRelations,
  });
}

export async function markAsPaid(id: string, tenantId: string) {
  await prisma.payment.findFirstOrThrow({ where: { id, tenantId, ...ACTIVE } });
  return prisma.payment.update({ where: { id }, data: { status: "paid", paidAt: new Date() } });
}

export async function markAsPending(id: string, tenantId: string) {
  await prisma.payment.findFirstOrThrow({ where: { id, tenantId, ...ACTIVE } });
  return prisma.payment.update({ where: { id }, data: { status: "pending", paidAt: null } });
}

/** Soft delete */
export async function deletePagamento(id: string, tenantId: string) {
  await prisma.payment.findFirstOrThrow({ where: { id, tenantId, ...ACTIVE } });
  return prisma.payment.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
}

/** Restore soft-deleted record */
export async function restorePagamento(id: string, tenantId: string) {
  await prisma.payment.findFirstOrThrow({ where: { id, tenantId, isDeleted: true } });
  return prisma.payment.update({
    where: { id },
    data: { isDeleted: false, deletedAt: null },
  });
}

export async function getPagamentosStats(tenantId: string) {
  const [total, paid, pending, partial, cancelled] = await Promise.all([
    prisma.payment.aggregate({ where: { tenantId, ...ACTIVE }, _sum: { amount: true }, _count: true }),
    prisma.payment.aggregate({ where: { tenantId, status: "paid", ...ACTIVE }, _sum: { amount: true }, _count: true }),
    prisma.payment.aggregate({ where: { tenantId, status: "pending", ...ACTIVE }, _sum: { amount: true }, _count: true }),
    prisma.payment.aggregate({ where: { tenantId, status: "partial", ...ACTIVE }, _sum: { amount: true }, _count: true }),
    prisma.payment.aggregate({ where: { tenantId, status: "cancelled", ...ACTIVE }, _sum: { amount: true }, _count: true }),
  ]);
  return { total, paid, pending, partial, cancelled };
}
