import { prisma } from "@/lib/prisma";

export async function getDashboardData(tenantId: string) {
  const now = new Date();

  // Início e fim do dia actual
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const todayEnd   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Início e fim do mês actual
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [
    totalClientes,
    totalColaboradores,
    totalServicosAtivos,
    agendamentosHoje,
    agendamentosHojeDetalhes,
    pagamentosPendentes,
    recebidoMes,
    agendamentosHojeStatus,
    proximasMarcocoes,
  ] = await Promise.all([
    // 1. Total de clientes
    prisma.client.count({ where: { tenantId } }),

    // 2. Total de colaboradores activos (todos, sem campo isActive no modelo)
    prisma.collaborator.count({ where: { tenantId } }),

    // 3. Serviços activos
    prisma.service.count({ where: { tenantId, isActive: true } }),

    // 4. Agendamentos de hoje (total)
    prisma.appointment.count({
      where: {
        tenantId,
        startDateTime: { gte: todayStart, lte: todayEnd },
      },
    }),

    // 5. Agendamentos de hoje com detalhes (próximas marcações)
    prisma.appointment.findMany({
      where: {
        tenantId,
        startDateTime: { gte: todayStart, lte: todayEnd },
      },
      include: {
        client:      { select: { id: true, name: true } },
        service:     { select: { id: true, name: true } },
        collaborator:{ select: { id: true, name: true } },
      },
      orderBy: { startDateTime: "asc" },
      take: 8,
    }),

    // 6. Pagamentos pendentes (count + soma)
    prisma.payment.aggregate({
      where: { tenantId, status: "pending" },
      _count: true,
      _sum: { amount: true },
    }),

    // 7. Total recebido no mês corrente
    prisma.payment.aggregate({
      where: {
        tenantId,
        status: "paid",
        paidAt: { gte: monthStart, lte: monthEnd },
      },
      _sum:   { amount: true },
      _count: true,
    }),

    // 8. Contagem de agendamentos de hoje por status (para o resumo do dia)
    prisma.appointment.groupBy({
      by: ["status"],
      where: {
        tenantId,
        startDateTime: { gte: todayStart, lte: todayEnd },
      },
      _count: { status: true },
    }),

    // 9. Próximas marcações (hoje a partir de agora ou futuras)
    prisma.appointment.findMany({
      where: {
        tenantId,
        startDateTime: { gte: now },
        status: { in: ["scheduled", "confirmed"] },
      },
      include: {
        client:  { select: { id: true, name: true } },
        service: { select: { id: true, name: true } },
      },
      orderBy: { startDateTime: "asc" },
      take: 6,
    }),
  ]);

  // Mapear contagens por status do dia
  const statusCountsMap = Object.fromEntries(
    agendamentosHojeStatus.map((g) => [g.status, g._count.status])
  );

  return {
    totalClientes,
    totalColaboradores,
    totalServicosAtivos,
    agendamentosHoje,
    agendamentosHojeDetalhes,
    proximasMarcocoes,
    pagamentosPendentes: {
      count: pagamentosPendentes._count,
      total: Number(pagamentosPendentes._sum.amount ?? 0),
    },
    recebidoMes: {
      total: Number(recebidoMes._sum.amount ?? 0),
      count: recebidoMes._count,
    },
    agendamentosHojePorStatus: {
      scheduled: statusCountsMap["scheduled"] ?? 0,
      completed: statusCountsMap["completed"] ?? 0,
      cancelled: statusCountsMap["cancelled"] ?? 0,
      no_show:   statusCountsMap["no_show"]   ?? 0,
    },
  };
}

