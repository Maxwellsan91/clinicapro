import { Banknote, PiggyBank, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface FinancialSummaryCardsProps {
  summary: {
    realizedValue: number;
    totalCosts: number;
    finalResult: number;
    savingsAmount: number;
    carriedBalance: number;
    paidRevenue: number;
    manualRevenueAdjustment: number;
  };
}

export function FinancialSummaryCards({ summary }: FinancialSummaryCardsProps) {
  const cards = [
    {
      label: "Valor realizado",
      value: summary.realizedValue,
      sub: `${formatCurrency(summary.paidRevenue)} pagamentos + ${formatCurrency(summary.manualRevenueAdjustment)} ajuste`,
      icon: Banknote,
      color: "text-emerald-700 bg-emerald-50 border-emerald-100",
    },
    {
      label: "Total de custos",
      value: summary.totalCosts,
      sub: "Despesas, impostos, seguros e investimento",
      icon: TrendingDown,
      color: "text-red-700 bg-red-50 border-red-100",
    },
    {
      label: "Resultado final",
      value: summary.finalResult,
      sub: summary.finalResult >= 0 ? "Resultado positivo no mês" : "Resultado negativo no mês",
      icon: TrendingUp,
      color: summary.finalResult >= 0 ? "text-blue-700 bg-blue-50 border-blue-100" : "text-red-700 bg-red-50 border-red-100",
    },
    {
      label: "Valor para poupança",
      value: summary.savingsAmount,
      sub: "Reserva definida manualmente",
      icon: PiggyBank,
      color: "text-purple-700 bg-purple-50 border-purple-100",
    },
    {
      label: "Saldo transitado",
      value: summary.carriedBalance,
      sub: "Saldo anterior + resultado - poupança",
      icon: Wallet,
      color: "text-slate-700 bg-slate-50 border-slate-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
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
  );
}
