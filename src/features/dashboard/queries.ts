import { prisma } from "@/lib/prisma";

export async function getDashboardData(tenantId: string) {
  const now = new Date();

  // ── Janelas de tempo ──────────────────────────────────────────────────
  const todayStart    = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const todayEnd      = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const monthStart    = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd      = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const prevMonthStart= new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd  = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  // Últimos 30 dias (para gráfico de atendimentos por dia)
  const last30Start   = new Date(now);
  last30Start.setDate(last30Start.getDate() - 29);
  last30Start.setHours(0, 0, 0, 0);
  // Últimos 6 meses (para gráfico de faturamento)
  const last6mStart   = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const BASE = { tenantId, isDeleted: false } as const;

  const [
    totalClientes,
    totalColaboradores,
    totalServicosAtivos,
    agendamentosHoje,
    proximasMarcocoes,
    pagamentosPendentes,
    recebidoMes,
    recebidoPrevMes,
    agendamentosMes,
    agendamentosPrevMes,
    agendamentosHojeStatus,
    // Para gráficos
    pagamentos6m,
    agendamentos30d,
    servicosUsados,
    colaboradoresAtendimentos,
  ] = await Promise.all([

    // 1. Total clientes
    prisma.client.count({ where: { ...BASE } }),

    // 2. Total colaboradores
    prisma.collaborator.count({ where: { ...BASE } }),

    // 3. Serviços activos
    prisma.service.count({ where: { ...BASE, isActive: true } }),

    // 4. Agendamentos hoje total
    prisma.appointment.count({
      where: { ...BASE, startDateTime: { gte: todayStart, lte: todayEnd } },
    }),

    // 5. Próximas marcações (até 6)
    prisma.appointment.findMany({
      where: {
        ...BASE,
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

    // 6. Pagamentos pendentes
    prisma.payment.aggregate({
      where: { ...BASE, status: "pending" },
      _count: true,
      _sum: { amount: true },
    }),

    // 7. Recebido mês actual
    prisma.payment.aggregate({
      where: { ...BASE, status: "paid", paidAt: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
      _count: true,
    }),

    // 8. Recebido mês anterior
    prisma.payment.aggregate({
      where: { ...BASE, status: "paid", paidAt: { gte: prevMonthStart, lte: prevMonthEnd } },
      _sum: { amount: true },
      _count: true,
    }),

    // 9. Agendamentos mês actual (todos os status)
    prisma.appointment.count({
      where: { ...BASE, startDateTime: { gte: monthStart, lte: monthEnd } },
    }),

    // 10. Agendamentos mês anterior
    prisma.appointment.count({
      where: { ...BASE, startDateTime: { gte: prevMonthStart, lte: prevMonthEnd } },
    }),

    // 11. Status de hoje
    prisma.appointment.groupBy({
      by: ["status"],
      where: { ...BASE, startDateTime: { gte: todayStart, lte: todayEnd } },
      _count: { status: true },
    }),

    // 12. Pagamentos últimos 6 meses (para gráfico de faturamento)
    prisma.payment.findMany({
      where: {
        ...BASE,
        status: "paid",
        paidAt: { gte: last6mStart, lte: monthEnd },
      },
      select: { paidAt: true, amount: true },
    }),

    // 13. Agendamentos últimos 30 dias (para gráfico de atendimentos/dia)
    prisma.appointment.findMany({
      where: {
        ...BASE,
        startDateTime: { gte: last30Start, lte: todayEnd },
        status: { notIn: ["cancelled"] },
      },
      select: { startDateTime: true, status: true },
    }),

    // 14. Top 5 serviços mais usados (mês actual)
    prisma.appointment.groupBy({
      by: ["serviceId"],
      where: {
        ...BASE,
        startDateTime: { gte: monthStart, lte: monthEnd },
        status: { notIn: ["cancelled"] },
      },
      _count: { serviceId: true },
      orderBy: { _count: { serviceId: "desc" } },
      take: 5,
    }),

    // 15. Top 5 colaboradores com mais atendimentos (mês actual)
    prisma.appointment.groupBy({
      by: ["collaboratorId"],
      where: {
        ...BASE,
        startDateTime: { gte: monthStart, lte: monthEnd },
        status: { notIn: ["cancelled"] },
      },
      _count: { collaboratorId: true },
      orderBy: { _count: { collaboratorId: "desc" } },
      take: 5,
    }),
  ]);

  // ── Pós-processamento ─────────────────────────────────────────────────

  // Status de hoje
  const statusMap = Object.fromEntries(agendamentosHojeStatus.map((g) => [g.status, g._count.status]));

  // Taxa de cancelamento (mês actual)
  const totalMes      = agendamentosMes;
  const canceladosMes = await prisma.appointment.count({
    where: { ...BASE, startDateTime: { gte: monthStart, lte: monthEnd }, status: "cancelled" },
  });
  const taxaCancelamento = totalMes > 0 ? Math.round((canceladosMes / totalMes) * 100) : 0;

  // Gráfico de faturamento — agrupar por mês
  const faturamentoMap: Record<string, number> = {};
  for (const p of pagamentos6m) {
    if (!p.paidAt) continue;
    const key = `${p.paidAt.getFullYear()}-${String(p.paidAt.getMonth() + 1).padStart(2, "0")}`;
    faturamentoMap[key] = (faturamentoMap[key] ?? 0) + Number(p.amount);
  }
  // Garantir que todos os 6 meses aparecem
  const faturamentoMensal = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("pt-PT", { month: "short", year: "2-digit" });
    return { key, label, valor: Math.round((faturamentoMap[key] ?? 0) * 100) / 100 };
  });

  // Gráfico de atendimentos — agrupar por dia (últimos 30 dias)
  const atendMap: Record<string, number> = {};
  for (const a of agendamentos30d) {
    const key = a.startDateTime.toISOString().slice(0, 10);
    atendMap[key] = (atendMap[key] ?? 0) + 1;
  }
  const atendimentosPorDia = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(last30Start);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });
    return { key, label, atendimentos: atendMap[key] ?? 0 };
  });

  // Resolver nomes dos serviços
  const serviceIds = servicosUsados.map((s) => s.serviceId);
  const services   = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true, name: true },
  });
  const serviceNameMap = Object.fromEntries(services.map((s) => [s.id, s.name]));
  const topServicos = servicosUsados.map((s) => ({
    nome: serviceNameMap[s.serviceId] ?? s.serviceId,
    total: s._count.serviceId,
  }));

  // Resolver nomes dos colaboradores
  const collabIds = colaboradoresAtendimentos.map((c) => c.collaboratorId);
  const collabs   = await prisma.collaborator.findMany({
    where: { id: { in: collabIds } },
    select: { id: true, name: true },
  });
  const collabNameMap = Object.fromEntries(collabs.map((c) => [c.id, c.name]));
  const topColaboradores = colaboradoresAtendimentos.map((c) => ({
    nome: collabNameMap[c.collaboratorId] ?? c.collaboratorId,
    total: c._count.collaboratorId,
  }));

  // Comparação mês actual vs anterior
  const receitaAtual  = Number(recebidoMes._sum.amount ?? 0);
  const receitaAnterior = Number(recebidoPrevMes._sum.amount ?? 0);
  const variacaoReceita = receitaAnterior > 0
    ? Math.round(((receitaAtual - receitaAnterior) / receitaAnterior) * 100)
    : receitaAtual > 0 ? 100 : 0;
  const variacaoAgendamentos = agendamentosPrevMes > 0
    ? Math.round(((agendamentosMes - agendamentosPrevMes) / agendamentosPrevMes) * 100)
    : agendamentosMes > 0 ? 100 : 0;

  return {
    // KPIs
    totalClientes,
    totalColaboradores,
    totalServicosAtivos,
    agendamentosHoje,
    proximasMarcocoes,
    pagamentosPendentes: {
      count: pagamentosPendentes._count,
      total: Number(pagamentosPendentes._sum.amount ?? 0),
    },
    recebidoMes: { total: receitaAtual, count: recebidoMes._count },
    agendamentosHojePorStatus: {
      scheduled: statusMap["scheduled"] ?? 0,
      completed:  statusMap["completed"]  ?? 0,
      cancelled:  statusMap["cancelled"]  ?? 0,
      no_show:    statusMap["no_show"]    ?? 0,
    },
    // Analíticos
    taxaCancelamento,
    canceladosMes,
    agendamentosMes,
    agendamentosPrevMes,
    receitaAnterior,
    variacaoReceita,
    variacaoAgendamentos,
    faturamentoMensal,
    atendimentosPorDia,
    topServicos,
    topColaboradores,
  };
}

