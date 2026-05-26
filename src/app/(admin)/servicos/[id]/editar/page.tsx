export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServicoForm } from "@/features/servicos/components/ServicoForm";
import { findServicoById } from "@/features/servicos/repository";
import { TENANT_ID } from "@/constants";

interface Props { params: Promise<{ id: string }> }

export default async function EditarServicoPage({ params }: Props) {
  const { id } = await params;
  const servico = await findServicoById(id, TENANT_ID);
  if (!servico) notFound();

  return (
    <div>
      <Header title="Editar Serviço" description={`Editando: ${servico.name}`} />
      <div className="p-6">
        <Card className="max-w-2xl">
          <CardHeader><CardTitle>Dados do Serviço</CardTitle></CardHeader>
          <CardContent><ServicoForm servico={servico} /></CardContent>
        </Card>
      </div>
    </div>
  );
}

