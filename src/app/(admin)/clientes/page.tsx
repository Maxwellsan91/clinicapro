export const dynamic = "force-dynamic";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClienteList } from "@/features/clientes/components/ClienteList";
import { findAllClientes } from "@/features/clientes/repository";
import { TENANT_ID } from "@/constants";
import { Plus, Trash2, Users } from "lucide-react";

interface Props {
  searchParams: Promise<{ deleted?: string }>;
}

export default async function ClientesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const showDeleted = sp.deleted === "1";
  const clientes = await findAllClientes(TENANT_ID, showDeleted);
  const active = clientes.filter((c) => !c.isDeleted);
  const deleted = clientes.filter((c) => c.isDeleted);

  return (
    <div>
      <Header title="Clientes" description="Gerencie os clientes da clínica" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500">
              {showDeleted
                ? `${deleted.length} eliminado${deleted.length !== 1 ? "s" : ""}`
                : `${active.length} utente${active.length !== 1 ? "s" : ""}`}
            </p>
            <Link
              href={showDeleted ? "/clientes" : "/clientes?deleted=1"}
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                showDeleted
                  ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {showDeleted ? "Ver activos" : `Ver eliminados (${deleted.length})`}
            </Link>
          </div>
          {!showDeleted && (
            <Link href="/clientes/novo">
              <Button><Plus className="w-4 h-4 mr-2" />Novo Cliente</Button>
            </Link>
          )}
        </div>
        <Card>
          <CardContent className="p-0">
            <ClienteList clientes={showDeleted ? deleted : active} showDeleted={showDeleted} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
