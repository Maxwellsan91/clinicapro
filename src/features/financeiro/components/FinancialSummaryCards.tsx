import { Banknote, Building2, Info, PiggyBank, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface FinancialSummaryCardsProps {
  summary: {
    realizedRevenue: number;
    operationalCosts: number;
    operationalResult: number;
    savingsReserve: number;
    investments: number;
    availableBalance: number;
    previousBalance: number;
    nextMonthBalance: number;
    savingsAmount: number;
    carriedBalance: number;
    paidRevenue: number;
    manualRevenueAdjustment: number;
    categoryIncome: number;
  };
}

export function FinancialSummaryCards({ summary }: FinancialSummaryCardsProps) {
  const cards = [
    {
      label: "Receita realizada",
      value: summary.realizedRevenue,
      sub: `${formatCurrency(summary.paidRevenue)} pagamentos + ${formatCurrency(summary.manualRevenueAdjustment)} ajuste + ${formatCurrency(summary.categoryIncome)} receitas`,
      icon: Banknote,
      color: "text-emerald-700 bg-emerald-50 border-emerald-100",
    },
    {
      label: "Custos operacionais",
      value: summary.operationalCosts,
      sub: "Pessoal, operação, impostos e seguros",
      icon: TrendingDown,
      color: "text-red-700 bg-red-50 border-red-100",
    },
    {
      label: "Resultado operacional",
      value: summary.operationalResult,
      sub: "Receita realizada menos custos operacionais.",
      icon: TrendingUp,
      color: summary.operationalResult >= 0 ? "text-blue-700 bg-blue-50 border-blue-100" : "text-red-700 bg-red-50 border-red-100",
    },
    {
      label: "Reservas / Poupança",
      value: summary.savingsReserve,
      sub: "Valores separados internamente, não considerados como custo.",
      icon: PiggyBank,
      color: "text-purple-700 bg-purple-50 border-purple-100",
    },
    {
      label: "Investimentos",
      value: summary.investments,
      sub: "Obras, equipamentos ou melhoria da clínica.",
      icon: Building2,
      color: "text-amber-700 bg-amber-50 border-amber-100",
    },
    {
      label: "Saldo disponível",
      value: summary.availableBalance,
      sub: "Saldo anterior + resultado - reservas - investimentos",
      icon: Wallet,
      color: "text-slate-700 bg-slate-50 border-slate-100",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{card.label}</p>
                <p className="mt-2 text-xl font-bold text-slate-900">{formatCurrency(card.value)}</p>
              </div>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${card.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">{card.sub}</p>
          </div>
        );
      })}
      </div>
      <div className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-blue-500" />
          Saldo transitado anterior: <strong className="text-slate-700">{formatCurrency(summary.previousBalance)}</strong>
        </span>
        <span>
          Saldo para o mês seguinte: <strong className="text-slate-700">{formatCurrency(summary.nextMonthBalance)}</strong>
        </span>
      </div>
    </div>
  );
}
