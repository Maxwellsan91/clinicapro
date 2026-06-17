export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { getColaboradorComissaoDetalhe } from "@/features/colaboradores/repository";
import { PeriodFilter } from "@/features/colaboradores/components/PeriodFilter";
import { RegisterCommissionPaymentModal } from "@/features/colaboradores/components/RegisterCommissionPaymentModal";
import { DeleteCommissionPaymentButton } from "@/features/colaboradores/components/DeleteCommissionPaymentButton";
import { isAdmin } from "@/features/auth/actions";
import { TENANT_ID } from "@/constants";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft, User, Briefcase, TrendingUp, DollarSign,
  Calendar, CheckCircle, Clock, AlertCircle, Banknote, Gift, Wallet,
} from "lucide-react";

// ── Helpers de período ────────────────────────────────────────────────────────

type PresetKey = "this_month" | "last_month" | "last_3" | "last_6" | "this_year" | "custom";

function resolvePeriod(
  preset: PresetKey,
  customFrom?: string,
  customTo?: string,
): { startDate: Date; endDate: Date; label: string } {
  const now = new Date();

  if (preset === "custom" && customFrom && customTo) {
    const s = new Date(customFrom + "T00:00:00");
    const e = new Date(customTo   + "T23:59:59.999");
    return { startDate: s, endDate: e, label: `${customFrom} → ${customTo}` };
  }

  if (preset === "last_month") {
    const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const e = new Date(now.getFullYear(), now.getMonth(),     0, 23, 59, 59, 999);
    return { startDate: s, endDate: e, label: s.toLocaleDateString("pt-PT", { month: "long", year: "numeric" }) };
  }

  if (preset === "last_3") {
    const s = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { startDate: s, endDate: e, label: "Últimos 3 meses" };
  }

  if (preset === "last_6") {
    const s = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { startDate: s, endDate: e, label: "Últimos 6 meses" };
  }

  if (preset === "this_year") {
    const s = new Date(now.getFullYear(), 0, 1);
    const e = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    return { startDate: s, endDate: e, label: String(now.getFullYear()) };
  }

  // default: this_month
  const s = new Date(now.getFullYear(), now.getMonth(), 1);
  const e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { startDate: s, endDate: e, label: s.toLocaleDateString("pt-PT", { month: "long", year: "numeric" }) };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  paid:      { label: "Pago",      color: "bg-green-100 text-green-700",   icon: CheckCircle },
  pending:   { label: "Pendente",  color: "bg-yellow-100 text-yellow-700", icon: Clock },
  partial:   { label: "Parcial",   color: "bg-blue-100 text-blue-700",     icon: AlertCircle },
  cancelled: { label: "Cancelado", color: "bg-gray-100 text-gray-700",     icon: AlertCircle },
  overdue:   { label: "Em atraso", color: "bg-red-100 text-red-700",       icon: AlertCircle },
};

const PAYMENT_TYPE_CONFIG = {
  payment: { label: "Pagamento", icon: Banknote, color: "bg-green-100 text-green-700" },
  advance: { label: "Adiantamento", icon: Gift,  color: "bg-blue-100 text-blue-700" },
};

const PAYMENT_ALLOCATION_CONFIG = {
  current_period: { label: "Período atual", color: "bg-purple-100 text-purple-700" },
  previous_balance: { label: "Pendência anterior", color: "bg-red-100 text-red-700" },
};

// ── Page ──────────────────────────────────────────────────────────────────────

interface PageProps {
  params:       Promise<{ id: string }>;
  searchParams: Promise<{ preset?: string; from?: string; to?: string }>;
}

export default async function ComissaoColaboradorPage({ params, searchParams }: PageProps) {
  if (!(await isAdmin())) redirect("/dashboard");

  const { id }     = await params;
  const sp         = await searchParams;
  const preset     = (sp.preset as PresetKey) || "this_month";
  const customFrom = sp.from;
  const customTo   = sp.to;

  const { startDate, endDate, label } = resolvePeriod(preset, customFrom, customTo);

  let data;
  try {
    data = await getColaboradorComissaoDetalhe(TENANT_ID, id, startDate, endDate);
  } catch {
    notFound();
  }

  const { colaborador, rows, totals, pagamentosEfetuados } = data;
  const initials = colaborador.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div>
      <Header
        title={`Comissões — ${colaborador.name}`}
        description={`Resumo de atendimentos · ${label}`}
      />

      <div className="p-6 space-y-6">

        {/* Voltar */}
        <Link href="/comissoes" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar às comissões
        </Link>

        {/* Colaborador header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-base font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-lg leading-tight">{colaborador.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary" className="text-xs">{colaborador.role}</Badge>
              {colaborador.email && <span className="text-xs text-gray-400">{colaborador.email}</span>}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-400 mb-0.5">Taxa de comissão</p>
            <p className="text-2xl font-bold text-purple-700">{colaborador.commissionRate}%</p>
          </div>
        </div>

        {/* Filtro de período */}
        <Suspense>
          <PeriodFilter currentPreset={preset} customFrom={customFrom} customTo={customTo} />
        </Suspense>

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-8 gap-4">
          {[
            { label: "Atendimentos",        value: String(totals.totalAtendimentos),            icon: Calendar,      iconBg: "bg-blue-50",   iconColor: "text-blue-600",   border: "border-blue-100" },
            { label: "Valor em atendimentos", value: formatCurrency(totals.totalFaturado),        icon: TrendingUp,    iconBg: "bg-green-50",  iconColor: "text-green-600",  border: "border-green-100" },
            { label: "Comissão gerada",      value: formatCurrency(totals.totalComissao),        icon: DollarSign,    iconBg: "bg-purple-50", iconColor: "text-purple-600", border: "border-purple-100" },
            { label: "Já pago do período", value: formatCurrency(totals.totalPagoAoColaborador), icon: Banknote, iconBg: "bg-teal-50",   iconColor: "text-teal-600",   border: "border-teal-100" },
            { label: "Pago pendência anterior", value: formatCurrency(totals.totalPagoPendenciaAnteriorNoPeriodo), icon: Banknote, iconBg: "bg-red-50",   iconColor: "text-red-600",   border: "border-red-100" },
            {
              label: totals.saldoDevido >= 0 ? "Saldo do período" : "Adiantamento no período",
              value: formatCurrency(Math.abs(totals.saldoDevido)),
              icon: Wallet,
              iconBg: totals.saldoDevido > 0 ? "bg-orange-50" : "bg-gray-50",
              iconColor: totals.saldoDevido > 0 ? "text-orange-600" : "text-gray-400",
              border: totals.saldoDevido > 0 ? "border-orange-200" : "border-gray-100",
            },
            {
              label: totals.saldoAnterior >= 0 ? "Pendência anterior" : "Crédito anterior",
              value: formatCurrency(Math.abs(totals.saldoAnterior)),
              icon: AlertCircle,
              iconBg: totals.saldoAnterior > 0 ? "bg-red-50" : "bg-gray-50",
              iconColor: totals.saldoAnterior > 0 ? "text-red-600" : "text-gray-400",
              border: totals.saldoAnterior > 0 ? "border-red-200" : "border-gray-100",
            },
            {
              label: totals.saldoTotalEmAberto >= 0 ? "Total em aberto" : "Crédito total",
              value: formatCurrency(Math.abs(totals.saldoTotalEmAberto)),
              icon: Wallet,
              iconBg: totals.saldoTotalEmAberto > 0 ? "bg-slate-100" : "bg-gray-50",
              iconColor: totals.saldoTotalEmAberto > 0 ? "text-slate-700" : "text-gray-400",
              border: "border-slate-200",
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={`bg-white rounded-xl border ${card.border} p-4 flex flex-col gap-2`}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-tight">{card.label}</p>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                    <Icon className={`w-3.5 h-3.5 ${card.iconColor}`} />
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900">{card.value}</p>
              </div>
            );
          })}
        </div>

        {/* ── Pagamentos ao colaborador ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-700">Pagamentos ao colaborador</h2>
              <span className="text-xs text-gray-400 font-normal">({label})</span>
            </div>
            <RegisterCommissionPaymentModal
              colaboradorId={colaborador.id}
              saldoPeriodo={totals.saldoDevido}
              saldoAnterior={totals.saldoAnterior}
            />
          </div>

          {pagamentosEfetuados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
              <Banknote className="w-7 h-7 opacity-30" />
              <p className="text-sm">Nenhum pagamento registado ainda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Data</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Tipo</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Referente a</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Notas</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Valor</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pagamentosEfetuados.map((pag) => {
                    const cfg = PAYMENT_TYPE_CONFIG[pag.type as keyof typeof PAYMENT_TYPE_CONFIG] ?? PAYMENT_TYPE_CONFIG.payment;
                    const allocationCfg =
                      PAYMENT_ALLOCATION_CONFIG[pag.allocationType as keyof typeof PAYMENT_ALLOCATION_CONFIG] ??
                      PAYMENT_ALLOCATION_CONFIG.current_period;
                    const Icon = cfg.icon;
                    return (
                      <tr key={pag.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {new Date(pag.paidAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                            <Icon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${allocationCfg.color}`}>
                            {allocationCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                          {pag.notes || <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                          {formatCurrency(Number(pag.amount))}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DeleteCommissionPaymentButton id={pag.id} colaboradorId={colaborador.id} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 font-semibold text-gray-700">
                      Total pago neste período
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-teal-700">
                      {formatCurrency(totals.totalPagoNoPeriodo)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* ── Tabela de atendimentos ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">
              Atendimentos concluídos — <span className="text-gray-400 font-normal">{label}</span>
            </h2>
          </div>

          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
              <User className="w-8 h-8 opacity-30" />
              <p className="text-sm">Nenhum atendimento concluído neste período</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Data</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Utente</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Serviço</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Duração</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Faturado</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Pagamento</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Comissão ({colaborador.commissionRate}%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rows.map((row) => {
                    const paymentStatus = row.payments.length === 0 ? null
                      : row.payments.every((p) => p.status === "paid") ? "paid"
                      : row.payments.some((p) => p.status === "pending") ? "pending"
                      : row.payments.some((p) => p.status === "partial") ? "partial"
                      : row.payments.some((p) => p.status === "cancelled") ? "cancelled"
                      : row.payments[0].status;
                    const statusCfg  = paymentStatus ? STATUS_CONFIG[paymentStatus] : null;
                    const StatusIcon = statusCfg?.icon;
                    return (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          <p>{new Date(row.startDateTime).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" })}</p>
                          <p className="text-xs text-gray-400">{new Date(row.startDateTime).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</p>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{row.clientName}</td>
                        <td className="px-4 py-3 text-gray-600">{row.serviceName}</td>
                        <td className="px-4 py-3 text-right text-gray-500">{row.serviceDuration} min</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {row.totalPrevisto > 0 ? (
                            <div>
                              <p>{formatCurrency(row.totalPrevisto)}</p>
                              {row.totalPago > 0 && (
                                <p className="text-xs text-green-600">Recebido: {formatCurrency(row.totalPago)}</p>
                              )}
                            </div>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {statusCfg && StatusIcon ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusCfg.label}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Sem pagamento</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-purple-700">
                          {row.totalPago > 0 ? formatCurrency(row.comissao) : <span className="text-gray-300 font-normal">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 font-semibold text-gray-700">
                      Total ({totals.totalAtendimentos} atendimento{totals.totalAtendimentos !== 1 ? "s" : ""})
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(totals.totalFaturado)}</td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 text-right font-bold text-purple-700">{formatCurrency(totals.totalComissao)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
