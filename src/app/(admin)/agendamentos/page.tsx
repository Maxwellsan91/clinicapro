export const dynamic = "force-dynamic";

import Link from "next/link";
import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AgendamentoCalendar } from "@/features/agendamentos/components/AgendamentoCalendar";
import { AgendamentoList } from "@/features/agendamentos/components/AgendamentoList";
import { findAllAgendamentos } from "@/features/agendamentos/repository";
import { findAllClientes } from "@/features/clientes/repository";
import { findAllColaboradores } from "@/features/colaboradores/repository";
import { findAllServicos } from "@/features/servicos/repository";
import { findActiveRecursos } from "@/features/recursos/repository";
import { TENANT_ID } from "@/constants";
import { serializeDecimal } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ deleted?: string }>;
}

export default async function AgendamentosPage({ searchParams }: PageProps) {
  const { deleted } = await searchParams;
  const showDeleted = deleted === "1";

  if (showDeleted) {
    // Vista de eliminados — usar listagem simples
    const raw = await findAllAgendamentos(TENANT_ID, true);
    const all = serializeDecimal(raw);
    const deletedList = all.filter((a) => a.isDeleted);

    return (
      <div>
        <Header title="Agendamentos" description="Gerencie os agendamentos da clínica" />
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-500">{deletedList.length} eliminado{deletedList.length !== 1 ? "s" : ""}</p>
              <Link href="/agendamentos"
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 transition-colors">
                ← Ver calendário
              </Link>
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <AgendamentoList agendamentos={deletedList} showDeleted />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Vista normal — calendário
  const [clientes, colaboradores, servicosRaw, recursos] = await Promise.all([
    findAllClientes(TENANT_ID),
    findAllColaboradores(TENANT_ID),
    findAllServicos(TENANT_ID),
    findActiveRecursos(TENANT_ID),
  ]);
  const servicos = serializeDecimal(servicosRaw);

  // Contar eliminados para o botão
  const rawAll = await findAllAgendamentos(TENANT_ID, true);
  const deletedCount = rawAll.filter((a) => a.isDeleted).length;

  return (
    <div>
      <Header title="Agendamentos" description="Gerencie os agendamentos da clínica" />
      <div className="p-6 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link
            href="/agendamentos?deleted=1"
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border bg-red-50 text-red-600 border-red-200 hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Eliminados ({deletedCount})
          </Link>
          <Link href="/agendamentos/novo">
            <Button><Plus className="w-4 h-4 mr-2" />Novo Agendamento</Button>
          </Link>
        </div>

        {/* Calendário */}
        <Suspense fallback={<div className="h-[700px] bg-white rounded-2xl border border-gray-100 animate-pulse" />}>
          <AgendamentoCalendar
            clientes={clientes.map((c) => ({ id: c.id, name: c.name }))}
            colaboradores={colaboradores.map((c) => ({ id: c.id, name: c.name, role: c.role, email: c.email }))}
            servicos={servicos.map((s) => ({ id: s.id, name: s.name, duration: s.duration }))}
            recursos={recursos.map((r) => ({ id: r.id, name: r.name, type: r.type }))}
          />
        </Suspense>
      </div>
    </div>
  );
}

