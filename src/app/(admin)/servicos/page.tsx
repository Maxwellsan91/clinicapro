export const dynamic = "force-dynamic";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ServicoList } from "@/features/servicos/components/ServicoList";
import { findAllServicos } from "@/features/servicos/repository";
import { TENANT_ID } from "@/constants";
import { serializeDecimal } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  searchParams: Promise<{ deleted?: string }>;
}

export default async function ServicosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const showDeleted = sp.deleted === "1";
  const raw = await findAllServicos(TENANT_ID, showDeleted);
  const all = serializeDecimal(raw);
  const active = all.filter((s) => !s.isDeleted);
  const deleted = all.filter((s) => s.isDeleted);
  const list = showDeleted ? deleted : active;

  return (
    <div>
      <Header title="Serviços" description="Gerencie os serviços oferecidos" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500">{list.length} serviço{list.length !== 1 ? "s" : ""}</p>
            <Link href={showDeleted ? "/servicos" : "/servicos?deleted=1"}
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${showDeleted ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"}`}>
              <Trash2 className="w-3.5 h-3.5" />
              {showDeleted ? "Ver activos" : `Ver eliminados (${deleted.length})`}
            </Link>
          </div>
          {!showDeleted && (
            <Link href="/servicos/novo"><Button><Plus className="w-4 h-4 mr-2" />Novo Serviço</Button></Link>
          )}
        </div>
        <Card><CardContent className="p-0"><ServicoList servicos={list} showDeleted={showDeleted} /></CardContent></Card>
      </div>
    </div>
  );
}
