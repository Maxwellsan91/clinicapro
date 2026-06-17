import { prisma } from "@/lib/prisma";
import type { CreateColaboradorInput, UpdateColaboradorInput } from "./schema";
import { syncMissingPaymentsForFinalizedAppointments } from "@/features/agendamentos/repository";

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

/** Creates a commission payment record for a collaborator */
export async function createCommissionPayment(
  tenantId: string,
  collaboratorId: string,
  data: {
    amount: number;
    type: "payment" | "advance";
    allocationType?: "current_period" | "previous_balance";
    notes?: string;
    paidAt: Date;
  },
) {
  await prisma.collaborator.findFirstOrThrow({ where: { id: collaboratorId, tenantId, isDeleted: false } });
  return prisma.commissionPayment.create({
    data: {
      tenantId,
      collaboratorId,
      amount:  data.amount,
      type:    data.type,
      allocationType: data.allocationType ?? "current_period",
      notes:   data.notes ?? null,
      paidAt:  data.paidAt,
    },
  });
}

/** Gets all commission payments for a collaborator (optionally filtered by period) */
export async function getCommissionPayments(
  tenantId: string,
  collaboratorId: string,
  startDate?: Date,
  endDate?: Date,
) {
  return prisma.commissionPayment.findMany({
    where: {
      tenantId,
      collaboratorId,
      ...(startDate && endDate ? { paidAt: { gte: startDate, lte: endDate } } : {}),
    },
    orderBy: { paidAt: "desc" },
  });
}

/** Gets total already paid to a collaborator (all time, regardless of period) */
export async function getTotalPaidToCollaborator(tenantId: string, collaboratorId: string) {
  const result = await prisma.commissionPayment.aggregate({
    where: { tenantId, collaboratorId },
    _sum: { amount: true },
  });
  return Number(result._sum.amount ?? 0);
}

/** Deletes a commission payment */
export async function deleteCommissionPayment(id: string, tenantId: string) {
  return prisma.commissionPayment.delete({ where: { id, tenantId } });
}

/** Returns detail of a collaborator's appointments + commission for a given period */
export async function getColaboradorComissaoDetalhe(
  tenantId: string,
  colaboradorId: string,
  startDate: Date,
  endDate: Date,
) {
  await syncMissingPaymentsForFinalizedAppointments(tenantId);

  const colaborador = await prisma.collaborator.findFirstOrThrow({
    where: { id: colaboradorId, tenantId, isDeleted: false },
    select: { id: true, name: true, role: true, email: true, commissionRate: true },
  });

  const [appointments, pagamentosEfetuados, previousAppointments, previousPayments] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        tenantId,
        collaboratorId: colaboradorId,
        isDeleted: false,
        status: "completed",
        startDateTime: { gte: startDate, lte: endDate },
      },
      include: {
        client:  { select: { id: true, name: true } },
        service: { select: { id: true, name: true, duration: true } },
        payments: {
          where: { isDeleted: false },
          select: { id: true, amount: true, status: true, paymentMethod: true, paidAt: true },
        },
      },
      orderBy: { startDateTime: "asc" },
    }),
    prisma.commissionPayment.findMany({
      where: {
        tenantId,
        collaboratorId: colaboradorId,
        paidAt: { gte: startDate, lte: endDate },
      },
      orderBy: { paidAt: "desc" },
    }),
    prisma.appointment.findMany({
      where: {
        tenantId,
        collaboratorId: colaboradorId,
        isDeleted: false,
        status: "completed",
        startDateTime: { lt: startDate },
      },
      include: {
        payments: {
          where: { isDeleted: false, status: "paid" },
          select: { amount: true },
        },
      },
    }),
    prisma.commissionPayment.findMany({
      where: {
        tenantId,
        collaboratorId: colaboradorId,
        paidAt: { lt: startDate },
      },
      select: { amount: true },
    }),
  ]);

  const commissionRate = Number(colaborador.commissionRate ?? 0);

  const rows = appointments.map((apt) => {
    const totalPago     = apt.payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
    const totalPendente = apt.payments.filter((p) => p.status === "pending").reduce((s, p) => s + Number(p.amount), 0);
    const totalParcial  = apt.payments.filter((p) => p.status === "partial").reduce((s, p) => s + Number(p.amount), 0);
    const totalCancelado = apt.payments.filter((p) => p.status === "cancelled").reduce((s, p) => s + Number(p.amount), 0);
    const totalPrevisto = apt.payments
      .filter((p) => p.status !== "cancelled")
      .reduce((s, p) => s + Number(p.amount), 0);
    const comissao      = (totalPago * commissionRate) / 100;
    return {
      id:              apt.id,
      startDateTime:   apt.startDateTime,
      clientName:      apt.client.name,
      serviceName:     apt.service.name,
      serviceDuration: apt.service.duration,
      totalPrevisto,
      totalPago,
      totalPendente,
      totalParcial,
      totalCancelado,
      comissao,
      payments:        apt.payments,
    };
  });

  const totalFaturado = rows.reduce((s, r) => s + r.totalPrevisto, 0);
  const totalRecebido = rows.reduce((s, r) => s + r.totalPago, 0);
  const totalParcial = rows.reduce((s, r) => s + r.totalParcial, 0);
  const totalComissao = rows.reduce((s, r) => s + r.comissao, 0);
  const totalPendente = rows.reduce((s, r) => s + r.totalPendente, 0);
  const totalCancelado = rows.reduce((s, r) => s + r.totalCancelado, 0);
  const pagamentosDoPeriodoAtual = pagamentosEfetuados.filter((payment) => payment.allocationType !== "previous_balance");
  const pagamentosDePendenciaAnterior = pagamentosEfetuados.filter((payment) => payment.allocationType === "previous_balance");
  const totalPagoAoColaborador = pagamentosDoPeriodoAtual.reduce((s, p) => s + Number(p.amount), 0);
  const totalPagoPendenciaAnteriorNoPeriodo = pagamentosDePendenciaAnterior.reduce((s, p) => s + Number(p.amount), 0);
  const totalPagoNoPeriodo = pagamentosEfetuados.reduce((s, p) => s + Number(p.amount), 0);
  const saldoDevido = totalComissao - totalPagoAoColaborador;
  const comissaoAnterior = previousAppointments.reduce((sum, apt) => {
    const totalPago = apt.payments.reduce((paymentSum, payment) => paymentSum + Number(payment.amount), 0);
    return sum + (totalPago * commissionRate) / 100;
  }, 0);
  const totalPagoAnteriorAoColaborador = previousPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const saldoAnteriorBruto = comissaoAnterior - totalPagoAnteriorAoColaborador;
  const saldoAnterior = saldoAnteriorBruto - totalPagoPendenciaAnteriorNoPeriodo;
  const saldoTotalEmAberto = saldoAnterior + saldoDevido;

  return {
    colaborador: { ...colaborador, commissionRate },
    rows,
    totals: {
      totalFaturado,
      totalRecebido,
      totalComissao,
      totalPendente,
      totalParcial,
      totalCancelado,
      totalAtendimentos: rows.length,
      totalPagoAoColaborador,
      totalPagoPendenciaAnteriorNoPeriodo,
      totalPagoNoPeriodo,
      saldoDevido,
      comissaoAnterior,
      totalPagoAnteriorAoColaborador,
      saldoAnteriorBruto,
      saldoAnterior,
      saldoTotalEmAberto,
    },
    pagamentosEfetuados,
  };
}

/** Returns collaborators with their earned commissions based on completed payments */
export async function getColaboradoresComissoes(tenantId: string) {
  await syncMissingPaymentsForFinalizedAppointments(tenantId);

  const colaboradores = await prisma.collaborator.findMany({
    where: { tenantId, ...ACTIVE },
    include: {
      appointments: {
        where: { tenantId, status: "completed", isDeleted: false },
        include: {
          payments: {
            where: { isDeleted: false },
            select: { amount: true, status: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return colaboradores.map((col) => {
    const totalPagamentos = col.appointments.reduce((sum, apt) => {
      const aptTotal = apt.payments
        .filter((payment) => payment.status !== "cancelled")
        .reduce((s, p) => s + Number(p.amount), 0);
      return sum + aptTotal;
    }, 0);
    const totalRecebido = col.appointments.reduce((sum, apt) => {
      const aptTotal = apt.payments
        .filter((payment) => payment.status === "paid")
        .reduce((s, p) => s + Number(p.amount), 0);
      return sum + aptTotal;
    }, 0);
    const commissionRate = Number(col.commissionRate ?? 0);
    const commissionValue = (totalRecebido * commissionRate) / 100;
    return {
      id: col.id,
      name: col.name,
      role: col.role,
      email: col.email,
      commissionRate,
      totalPagamentos,
      totalRecebido,
      commissionValue,
      appointmentsCompleted: col.appointments.length,
    };
  });
}
