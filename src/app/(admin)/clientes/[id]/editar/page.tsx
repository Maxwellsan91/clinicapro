export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClienteForm } from "@/features/clientes/components/ClienteForm";
import { findClienteById } from "@/features/clientes/repository";
import { TENANT_ID } from "@/constants";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarClientePage({ params }: Props) {
  const { id } = await params;
  const cliente = await findClienteById(id, TENANT_ID);

  if (!cliente) notFound();

  return (
    <div>
      <Header title="Editar Cliente" description={`Editando: ${cliente.name}`} />
      <div className="p-6">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <ClienteForm cliente={cliente} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

