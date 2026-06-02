export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResourceForm } from "@/features/recursos/components/ResourceForm";
import { findRecursoById } from "@/features/recursos/repository";
import { TENANT_ID } from "@/constants";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarRecursoPage({ params }: Props) {
  const { id } = await params;
  const recurso = await findRecursoById(id, TENANT_ID);
  if (!recurso) notFound();

  return (
    <div>
      <Header
        title="Editar Recurso"
        description={`Editando: ${recurso.name}`}
      />
      <div className="p-6">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Dados do Recurso</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceForm recurso={recurso} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

