export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PagamentoForm } from "@/features/pagamentos/components/PagamentoForm";
import { findAllClientes } from "@/features/clientes/repository";
import { findAllAgendamentos } from "@/features/agendamentos/repository";
import { TENANT_ID } from "@/constants";
import { serializeDecimal } from "@/lib/utils";

export default async function NovoPagamentoPage() {
  const [clientes, agendamentosRaw] = await Promise.all([
    findAllClientes(TENANT_ID),
    findAllAgendamentos(TENANT_ID),
  ]);

  const agendamentos = serializeDecimal(agendamentosRaw);

  return (
    <div>
      <Header
        title="Novo Pagamento"
        description="Registe um novo pagamento"
      />
      <div className="p-6">
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Dados do Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <PagamentoForm
              clientes={clientes}
              agendamentos={agendamentos}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

