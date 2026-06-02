export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getColaboradoresComissoes } from "@/features/colaboradores/repository";
import { isAdmin } from "@/features/auth/actions";
import { TENANT_ID } from "@/constants";
import { formatCurrency } from "@/lib/utils";
import { Percent, Users, TrendingUp, DollarSign } from "lucide-react";
import { CommissionRateEditor } from "@/features/colaboradores/components/CommissionRateEditor";

export default async function ComissoesPage() {
  if (!(await isAdmin())) {
    redirect("/dashboard");
  }

  const colaboradores = await getColaboradoresComissoes(TENANT_ID);

  const totalComissoes = colaboradores.reduce((s, c) => s + c.commissionValue, 0);
  const totalFaturado = colaboradores.reduce((s, c) => s + c.totalPagamentos, 0);

  return (
    <div>
      <Header title="Comissões" description="Gestão de comissões dos colaboradores" />

      <div className="p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-blue-200 bg-white p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Colaboradores</p>
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{colaboradores.length}</p>
          </div>
          <div className="rounded-xl border border-green-200 bg-white p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Faturado</p>
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-green-100">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(totalFaturado)}</p>
            <p className="text-xs text-gray-400">em serviços concluídos</p>
          </div>
          <div className="rounded-xl border border-purple-200 bg-white p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total a Pagar</p>
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-purple-100">
                <DollarSign className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-700">{formatCurrency(totalComissoes)}</p>
            <p className="text-xs text-gray-400">em comissões a liquidar</p>
          </div>
        </div>

        {/* Table */}
        <Card className="overflow-hidden shadow-sm">
          <CardHeader className="border-b border-gray-100 py-4">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Percent className="w-4 h-4" />
              Comissões por Colaborador
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Colaborador</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Cargo</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Serviços</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Faturado</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Taxa (%)</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Comissão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {colaboradores.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                        Nenhum colaborador encontrado.
                      </td>
                    </tr>
                  ) : (
                    colaboradores.map((col) => (
                      <tr key={col.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{col.name}</p>
                            {col.email && (
                              <p className="text-xs text-gray-400">{col.email}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="text-xs">{col.role}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {col.appointmentsCompleted}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {formatCurrency(col.totalPagamentos)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <CommissionRateEditor
                            colaboradorId={col.id}
                            currentRate={col.commissionRate}
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-purple-700">
                          {formatCurrency(col.commissionValue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

