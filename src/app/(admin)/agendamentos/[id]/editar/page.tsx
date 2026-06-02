export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgendamentoForm } from "@/features/agendamentos/components/AgendamentoForm";
import { findAgendamentoById } from "@/features/agendamentos/repository";
import { findAllClientes } from "@/features/clientes/repository";
import { findAllColaboradores } from "@/features/colaboradores/repository";
import { findAllServicos } from "@/features/servicos/repository";
import { findActiveRecursos } from "@/features/recursos/repository";
import { TENANT_ID } from "@/constants";
import { serializeDecimal } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarAgendamentoPage({ params }: Props) {
  const { id } = await params;

  const [agendamentoRaw, clientes, colaboradores, servicosRaw, recursos] = await Promise.all([
    findAgendamentoById(id, TENANT_ID),
    findAllClientes(TENANT_ID),
    findAllColaboradores(TENANT_ID),
    findAllServicos(TENANT_ID),
    findActiveRecursos(TENANT_ID),
  ]);

  if (!agendamentoRaw) notFound();

  const agendamento = serializeDecimal(agendamentoRaw);
  const servicos = serializeDecimal(servicosRaw);

  return (
    <div>
      <Header
        title="Editar Agendamento"
        description={`Editando agendamento de ${agendamento.client.name}`}
      />
      <div className="p-6">
        <Card className="max-w-2xl">
          <CardHeader><CardTitle>Dados do Agendamento</CardTitle></CardHeader>
          <CardContent>
            <AgendamentoForm
              agendamento={agendamento}
              clientes={clientes}
              colaboradores={colaboradores}
              servicos={servicos}
              recursos={recursos}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



