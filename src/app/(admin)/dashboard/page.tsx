export const dynamic = "force-dynamic";

import Link from "next/link";
import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { getDashboardData } from "@/features/dashboard/queries";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import {
  FaturamentoChart,
  AtendimentosChart,
  TopServicosChart,
  TopColaboradoresChart,
} from "@/features/dashboard/components/Charts";
import { TENANT_ID } from "@/constants";
import { formatCurrency } from "@/lib/utils";
import {
  Users, UserCog, Briefcase, Calendar,
  TrendingUp, TrendingDown, Minus,
  Clock, CheckCircle, XCircle, Euro,
  AlertCircle, ArrowRight, Activity,
} from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────
function Trend({ value }: { value: number }) {
  if (value > 0) return (
    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
      <TrendingUp className="w-3 h-3" />+{value}%
    </span>
  );
  if (value < 0) return (
    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-red-500">
      <TrendingDown className="w-3 h-3" />{value}%
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-400">
      <Minus className="w-3 h-3" />0%
    </span>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

const STATUS_CONFIG = {
  scheduled: { label: "Agendados",       color: "bg-yellow-100 text-yellow-800", icon: Clock },
  completed:  { label: "Concluídos",      color: "bg-green-100  text-green-800",  icon: CheckCircle },
  cancelled:  { label: "Cancelados",      color: "bg-gray-100   text-gray-700",   icon: XCircle },
  no_show:    { label: "Não compareceu",  color: "bg-red-100    text-red-800",    icon: XCircle },
};

// ── Componente assíncrono principal ───────────────────────────────────
async function DashboardContent() {
  const d = await getDashboardData(TENANT_ID);

  const kpiCards = [
    {
      title: "Receita do Mês",
      value: formatCurrency(d.recebidoMes.total),
      sub: `${d.recebidoMes.count} pagamentos recebidos`,
      icon: Euro,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      trend: <Trend value={d.variacaoReceita} />,
      trendLabel: "vs mês anterior",
      href: "/pagamentos?status=paid",
    },
    {
      title: "Agendamentos — Mês",
      value: String(d.agendamentosMes),
      sub: `${d.agendamentosHoje} hoje`,
      icon: Calendar,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: <Trend value={d.variacaoAgendamentos} />,
      trendLabel: "vs mês anterior",
      href: "/agendamentos",
    },
    {
      title: "Pagamentos Pendentes",
      value: formatCurrency(d.pagamentosPendentes.total),
      sub: `${d.pagamentosPendentes.count} em aberto`,
      icon: AlertCircle,
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
      href: "/pagamentos?status=pending",
    },
    {
      title: "Taxa de Cancelamento",
      value: `${d.taxaCancelamento}%`,
      sub: `${d.canceladosMes} cancelados este mês`,
      icon: XCircle,
      iconBg: d.taxaCancelamento > 20 ? "bg-red-50" : "bg-slate-50",
      iconColor: d.taxaCancelamento > 20 ? "text-red-500" : "text-slate-400",
      href: "/agendamentos",
    },
  ];

  const statsCards = [
    { label: "Utentes",     value: d.totalClientes,       icon: Users,     href: "/clientes",       color: "text-blue-600 bg-blue-50" },
    { label: "Colaboradores",value: d.totalColaboradores, icon: UserCog,   href: "/colaboradores",  color: "text-purple-600 bg-purple-50" },
    { label: "Serviços",    value: d.totalServicosAtivos, icon: Briefcase, href: "/servicos",        color: "text-green-600 bg-green-50" },
    { label: "Hoje",        value: d.agendamentosHoje,    icon: Activity,  href: "/agendamentos",    color: "text-orange-600 bg-orange-50" },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* ── Stats rápidas ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statsCards.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href}>
              <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3 hover:shadow-sm transition-shadow cursor-pointer">
                <div className={`p-2.5 rounded-xl shrink-0 ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 truncate">{s.label}</p>
                  <p className="text-2xl font-bold text-slate-900 leading-tight">{s.value}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((k) => {
          const Icon = k.icon;
          return (
            <Link key={k.title} href={k.href}>
              <div className="bg-white rounded-2xl border border-slate-100 p-5 h-full hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-tight max-w-[70%]">{k.title}</p>
                  <div className={`p-2 rounded-xl shrink-0 ${k.iconBg}`}>
                    <Icon className={`w-4 h-4 ${k.iconColor}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-1">{k.value}</p>
                <p className="text-xs text-slate-400 mb-2">{k.sub}</p>
                {k.trend && (
                  <div className="flex items-center gap-1.5">
                    {k.trend}
                    <span className="text-xs text-slate-400">{k.trendLabel}</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Gráficos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Faturamento mensal */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-start justify-between mb-1">
            <SectionTitle title="Faturamento — Últimos 6 Meses" />
            <span className="text-xs text-slate-400 mt-0.5">
              Anterior: {formatCurrency(d.receitaAnterior)}
            </span>
          </div>
          <FaturamentoChart data={d.faturamentoMensal} />
        </div>

        {/* Atendimentos por dia */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <SectionTitle title="Atendimentos — Últimos 30 Dias" subtitle="Excluindo cancelamentos" />
          <AtendimentosChart data={d.atendimentosPorDia} />
        </div>
      </div>

      {/* ── Linha inferior ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Resumo de hoje */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <SectionTitle title="Resumo de Hoje" subtitle={`${d.agendamentosHoje} marcações no total`} />
          <div className="space-y-2">
            {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map((key) => {
              const cfg = STATUS_CONFIG[key];
              const count = d.agendamentosHojePorStatus[key];
              const Icon = cfg.icon;
              return (
                <div key={key} className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${cfg.color}`}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-sm font-medium">{cfg.label}</span>
                  </div>
                  <span className="text-lg font-bold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top serviços */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <SectionTitle title="Serviços Mais Utilizados" subtitle="Este mês" />
          <TopServicosChart data={d.topServicos} />
        </div>

        {/* Top colaboradores */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <SectionTitle title="Colaboradores" subtitle="Atendimentos este mês" />
          {d.topColaboradores.length > 0 ? (
            <TopColaboradoresChart data={d.topColaboradores} />
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">Sem dados este mês</p>
          )}
        </div>
      </div>

      {/* ── Próximas Marcações ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle title="Próximas Marcações" />
          <Link href="/agendamentos" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            Ver todas <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {d.proximasMarcocoes.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Sem marcações futuras</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {d.proximasMarcocoes.map((apt) => {
              const hora = new Intl.DateTimeFormat("pt-PT", { hour: "2-digit", minute: "2-digit" }).format(new Date(apt.startDateTime));
              const dia  = new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit" }).format(new Date(apt.startDateTime));
              const initials = apt.client.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
              return (
                <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{apt.client.name}</p>
                    <p className="text-xs text-slate-400 truncate">{apt.service.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-slate-700">{hora}</p>
                    <p className="text-xs text-slate-400">{dia}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Comparação Mês Actual vs Anterior ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <SectionTitle title="Comparação — Mês Actual vs Anterior" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              label: "Receita",
              actual: formatCurrency(d.recebidoMes.total),
              anterior: formatCurrency(d.receitaAnterior),
              variacao: d.variacaoReceita,
              icon: Euro,
              color: "bg-emerald-50 text-emerald-600",
            },
            {
              label: "Agendamentos",
              actual: String(d.agendamentosMes),
              anterior: String(d.agendamentosPrevMes),
              variacao: d.variacaoAgendamentos,
              icon: Calendar,
              color: "bg-blue-50 text-blue-600",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                <div className={`p-3 rounded-xl shrink-0 ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-xl font-bold text-slate-900">{item.actual}</span>
                    <span className="text-xs text-slate-400">vs {item.anterior}</span>
                    <Trend value={item.variacao} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <div>
      <Header title="Dashboard" description="Visão analítica da clínica" />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
