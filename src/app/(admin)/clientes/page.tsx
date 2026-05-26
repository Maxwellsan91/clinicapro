export const dynamic = "force-dynamic";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClienteList } from "@/features/clientes/components/ClienteList";
import { findAllClientes } from "@/features/clientes/repository";
import { TENANT_ID } from "@/constants";
import { Plus } from "lucide-react";

export default async function ClientesPage() {
  const clientes = await findAllClientes(TENANT_ID);

  return (
    <div>
      <Header title="Clientes" description="Gerencie os clientes da clínica" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500">{clientes.length} cliente{clientes.length !== 1 ? "s" : ""} cadastrado{clientes.length !== 1 ? "s" : ""}</p>
          </div>
          <Link href="/clientes/novo">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            <ClienteList clientes={clientes} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

