export const dynamic = "force-dynamic";

import Link from "next/link";
import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PagamentoList } from "@/features/pagamentos/components/PagamentoList";
import { PagamentoFilters } from "@/features/pagamentos/components/PagamentoFilters";
import {
  findAllPagamentos,
  getPagamentosStats,
} from "@/features/pagamentos/repository";
import { TENANT_ID } from "@/constants";
import { serializeDecimal, formatCurrency } from "@/lib/utils";
import { Plus, Euro, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function PagamentosPage({ searchParams }: PageProps) {
  const { status } = await searchParams;

  const [rawAll, stats] = await Promise.all([
    findAllPagamentos(TENANT_ID),
    getPagamentosStats(TENANT_ID),
  ]);

  const todos = serializeDecimal(rawAll);
  const pagamentos = status ? todos.filter((p) => p.status === status) : todos;

  const totalRecebido = Number(stats.paid._sum.amount ?? 0);
  const totalPendente = Number(stats.pending._sum.amount ?? 0);
  const totalParcial = Number(stats.partial._sum.amount ?? 0);
  const totalGeral = Number(stats.total._sum.amount ?? 0);

  return (
    <div>
      <Header
        title="Pagamentos"
        description="Gestão de pagamentos e faturas"
      />

      <div className="p-6 space-y-6">
        {/* Cards de resumo financeiro */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl border bg-white p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Geral</p>
              <Euro className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalGeral)}</p>
            <p className="text-xs text-gray-400">{stats.total._count} pagamentos</p>
          </div>
          <div className="rounded-xl border bg-white p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-green-700 uppercase tracking-wider">Recebido</p>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(totalRecebido)}</p>
            <p className="text-xs text-gray-400">{stats.paid._count} pagos</p>
          </div>
          <div className="rounded-xl border bg-white p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-yellow-700 uppercase tracking-wider">Pendente</p>
              <Clock className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-yellow-700">{formatCurrency(totalPendente)}</p>
            <p className="text-xs text-gray-400">{stats.pending._count} pendentes</p>
          </div>
          <div className="rounded-xl border bg-white p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-blue-700 uppercase tracking-wider">Parcial</p>
              <AlertCircle className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalParcial)}</p>
            <p className="text-xs text-gray-400">{stats.partial._count} parciais</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Suspense fallback={<div className="h-9" />}>
            <PagamentoFilters />
          </Suspense>
          <Link href="/pagamentos/novo">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Pagamento
            </Button>
          </Link>
        </div>

        {/* Lista */}
        <Card>
          <CardContent className="p-0">
            <PagamentoList pagamentos={pagamentos} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

