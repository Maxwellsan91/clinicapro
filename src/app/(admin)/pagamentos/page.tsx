export const dynamic = "force-dynamic";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PagamentoList } from "@/features/pagamentos/components/PagamentoList";
import { PagamentoFilters } from "@/features/pagamentos/components/PagamentoFilters";
import { syncMissingPaymentsForFinalizedAppointments } from "@/features/agendamentos/repository";
import {
  findAllPagamentos,
  getPagamentosStats,
} from "@/features/pagamentos/repository";
import { TENANT_ID } from "@/constants";
import { serializeDecimal, formatCurrency } from "@/lib/utils";
import {
  Plus,
  Euro,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Trash2,
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{ status?: string; deleted?: string }>;
}

export default async function PagamentosPage({ searchParams }: PageProps) {
  const { status, deleted } = await searchParams;
  const showDeleted = deleted === "1";

  await syncMissingPaymentsForFinalizedAppointments(TENANT_ID);

  const [rawAll, stats] = await Promise.all([
    findAllPagamentos(TENANT_ID, showDeleted),
    getPagamentosStats(TENANT_ID),
  ]);

  const todos = serializeDecimal(rawAll);
  const active = todos.filter((p) => !p.isDeleted);
  const deletedList = todos.filter((p) => p.isDeleted);
  const pagamentos = showDeleted
    ? deletedList
    : status ? active.filter((p) => p.status === status) : active;

  const totalRecebido = Number(stats.paid._sum.amount ?? 0);
  const totalPendente = Number(stats.pending._sum.amount ?? 0);
  const totalParcial = Number(stats.partial._sum.amount ?? 0);
  const totalCancelado = Number(stats.cancelled._sum.amount ?? 0);
  const totalGeral = Number(stats.total._sum.amount ?? 0);

  const pctRecebido = totalGeral > 0 ? Math.round((totalRecebido / totalGeral) * 100) : 0;

  const summaryCards = [
    {
      label: "Total Geral",
      value: formatCurrency(totalGeral),
      sub: `${stats.total._count} pagamentos`,
      icon: Euro,
      iconBg: "bg-gray-100",
      iconColor: "text-gray-600",
      border: "border-gray-200",
    },
    {
      label: "Recebido",
      value: formatCurrency(totalRecebido),
      sub: `${stats.paid._count} pagos · ${pctRecebido}% do total`,
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      border: "border-green-200",
      valueColor: "text-green-700",
    },
    {
      label: "Pendente",
      value: formatCurrency(totalPendente),
      sub: `${stats.pending._count} em aberto`,
      icon: Clock,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      border: "border-yellow-200",
      valueColor: "text-yellow-700",
    },
    {
      label: "Pago parcial",
      value: formatCurrency(totalParcial),
      sub: `${stats.partial._count} pagamentos`,
      icon: AlertCircle,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      border: "border-blue-200",
      valueColor: "text-blue-700",
    },
    {
      label: "Cancelado",
      value: formatCurrency(totalCancelado),
      sub: `${stats.cancelled._count} pagamentos`,
      icon: Trash2,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      border: "border-red-200",
      valueColor: "text-red-700",
    },
  ];

  return (
    <div>
      <Header title="Pagamentos" description="Gestão de pagamentos e faturas" />

      <div className="p-6 space-y-6">

        {/* ── Cards de resumo ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {summaryCards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className={`rounded-xl border ${c.border} bg-white p-4 flex flex-col gap-3`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {c.label}
                  </p>
                  <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${c.iconBg}`}>
                    <Icon className={`w-4 h-4 ${c.iconColor}`} />
                  </div>
                </div>
                <div>
                  <p className={`text-xl font-bold ${c.valueColor ?? "text-gray-900"}`}>
                    {c.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
                </div>
                {/* Barra de progresso só no card "Recebido" */}
                {c.label === "Recebido" && totalGeral > 0 && (
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-auto">
                    <div
                      className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${pctRecebido}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              A mostrar <span className="font-semibold text-gray-700">{pagamentos.length}</span> pagamento{pagamentos.length !== 1 ? "s" : ""}
            </span>
            <span className="hidden sm:inline text-xs text-gray-400">
              Ordenado pela última edição
            </span>
            <Link href={showDeleted ? "/pagamentos" : "/pagamentos?deleted=1"}
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${showDeleted ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"}`}>
              <Trash2 className="w-3.5 h-3.5" />
              {showDeleted ? "Ver activos" : `Eliminados (${deletedList.length})`}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {!showDeleted && <PagamentoFilters current={status ?? ""} />}
            {!showDeleted && (
              <Link href="/pagamentos/novo">
                <Button className="gap-1.5 rounded-lg"><Plus className="w-4 h-4" />Novo Pagamento</Button>
              </Link>
            )}
          </div>
        </div>

        {/* ── Lista ── */}
        <Card className="overflow-hidden shadow-sm">
          <CardContent className="p-0">
            <PagamentoList pagamentos={pagamentos} showDeleted={showDeleted} />
          </CardContent>
        </Card>

        {/* Dica de interacção */}
        {pagamentos.length > 0 && (
          <p className="text-center text-xs text-gray-400">
            💡 Clique em qualquer linha para ver os detalhes completos do pagamento
          </p>
        )}
      </div>
    </div>
  );
}
