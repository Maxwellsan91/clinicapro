export const dynamic = "force-dynamic";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ResourceList } from "@/features/recursos/components/ResourceList";
import { findAllRecursos } from "@/features/recursos/repository";
import { TENANT_ID } from "@/constants";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  searchParams: Promise<{ deleted?: string }>;
}

export default async function RecursosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const showDeleted = sp.deleted === "1";
  const all = await findAllRecursos(TENANT_ID, showDeleted);
  const active  = all.filter((r) => !r.isDeleted);
  const deleted = all.filter((r) => r.isDeleted);
  const list = showDeleted ? deleted : active;

  return (
    <div>
      <Header
        title="Recursos"
        description="Gerencie salas, gabinetes e equipamentos da clínica"
      />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500">
              {list.length} recurso{list.length !== 1 ? "s" : ""}
            </p>
            <Link
              href={showDeleted ? "/recursos" : "/recursos?deleted=1"}
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                showDeleted
                  ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {showDeleted
                ? "Ver ativos"
                : `Ver eliminados (${deleted.length})`}
            </Link>
          </div>
          {!showDeleted && (
            <Link href="/recursos/novo">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Recurso
              </Button>
            </Link>
          )}
        </div>
        <Card>
          <CardContent className="p-0">
            <ResourceList recursos={list} showDeleted={showDeleted} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

