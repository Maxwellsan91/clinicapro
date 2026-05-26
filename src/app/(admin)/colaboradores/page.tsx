export const dynamic = "force-dynamic";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ColaboradorList } from "@/features/colaboradores/components/ColaboradorList";
import { findAllColaboradores } from "@/features/colaboradores/repository";
import { TENANT_ID } from "@/constants";
import { Plus } from "lucide-react";

export default async function ColaboradoresPage() {
  const colaboradores = await findAllColaboradores(TENANT_ID);

  return (
    <div>
      <Header title="Colaboradores" description="Gerencie a equipe da clínica" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">{colaboradores.length} colaborador{colaboradores.length !== 1 ? "es" : ""} cadastrado{colaboradores.length !== 1 ? "s" : ""}</p>
          <Link href="/colaboradores/novo">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Colaborador
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            <ColaboradorList colaboradores={colaboradores} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

