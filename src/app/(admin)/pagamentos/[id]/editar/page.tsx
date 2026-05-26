export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PagamentoForm } from "@/features/pagamentos/components/PagamentoForm";
import { findPagamentoById } from "@/features/pagamentos/repository";
import { findAllClientes } from "@/features/clientes/repository";
import { findAllAgendamentos } from "@/features/agendamentos/repository";
import { TENANT_ID } from "@/constants";
import { serializeDecimal } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarPagamentoPage({ params }: Props) {
  const { id } = await params;

  const [pagamentoRaw, clientes, agendamentosRaw] = await Promise.all([
    findPagamentoById(id, TENANT_ID),
    findAllClientes(TENANT_ID),
    findAllAgendamentos(TENANT_ID),
  ]);

  if (!pagamentoRaw) notFound();

  const pagamento = serializeDecimal(pagamentoRaw);
  const agendamentos = serializeDecimal(agendamentosRaw);

  return (
    <div>
      <Header
        title="Editar Pagamento"
        description={`A editar pagamento de ${pagamento.client.name}`}
      />
      <div className="p-6">
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Dados do Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <PagamentoForm
              pagamento={pagamento}
              clientes={clientes}
              agendamentos={agendamentos}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

