export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColaboradorForm } from "@/features/colaboradores/components/ColaboradorForm";
import { findColaboradorById } from "@/features/colaboradores/repository";
import { TENANT_ID } from "@/constants";

interface Props { params: Promise<{ id: string }> }

export default async function EditarColaboradorPage({ params }: Props) {
  const { id } = await params;
  const colaborador = await findColaboradorById(id, TENANT_ID);
  if (!colaborador) notFound();

  return (
    <div>
      <Header title="Editar Colaborador" description={`Editando: ${colaborador.name}`} />
      <div className="p-6">
        <Card className="max-w-2xl">
          <CardHeader><CardTitle>Dados do Colaborador</CardTitle></CardHeader>
          <CardContent><ColaboradorForm colaborador={colaborador} /></CardContent>
        </Card>
      </div>
    </div>
  );
}

