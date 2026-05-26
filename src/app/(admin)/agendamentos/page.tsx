export const dynamic = "force-dynamic";

import Link from "next/link";
import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AgendamentoList } from "@/features/agendamentos/components/AgendamentoList";
import { AgendamentoFilters } from "@/features/agendamentos/components/AgendamentoFilters";
import { findAllAgendamentos } from "@/features/agendamentos/repository";
import { TENANT_ID } from "@/constants";
import { Plus, Calendar } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AgendamentosPage({ searchParams }: PageProps) {
  const { status } = await searchParams;

  const todos = await findAllAgendamentos(TENANT_ID);

  const agendamentos = status
    ? todos.filter((a) => a.status === status)
    : todos;

  // Contadores por status
  const counts = {
    total: todos.length,
    scheduled: todos.filter((a) => a.status === "scheduled").length,
    completed: todos.filter((a) => a.status === "completed").length,
    cancelled: todos.filter((a) => a.status === "cancelled").length,
    no_show: todos.filter((a) => a.status === "no_show").length,
  };

  return (
    <div>
      <Header
        title="Agendamentos"
        description="Gerencie os agendamentos da clínica"
      />

      <div className="p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: counts.total, color: "bg-blue-50 text-blue-700" },
            { label: "Agendados", value: counts.scheduled, color: "bg-yellow-50 text-yellow-700" },
            { label: "Concluídos", value: counts.completed, color: "bg-green-50 text-green-700" },
            { label: "Cancelados", value: counts.cancelled, color: "bg-red-50 text-red-700" },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-xl p-4 ${item.color} flex items-center justify-between`}
            >
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-2xl font-bold">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Suspense fallback={<div className="h-9" />}>
            <AgendamentoFilters />
          </Suspense>
          <Link href="/agendamentos/novo">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
          </Link>
        </div>

        {/* List */}
        <Card>
          <CardContent className="p-0">
            {agendamentos.length === 0 && status ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">
                  Nenhum agendamento com este status
                </p>
                <p className="text-sm mt-1">
                  Tente outro filtro ou crie um novo agendamento
                </p>
              </div>
            ) : (
              <AgendamentoList agendamentos={agendamentos} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

