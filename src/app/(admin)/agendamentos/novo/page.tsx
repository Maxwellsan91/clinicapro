export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgendamentoForm } from "@/features/agendamentos/components/AgendamentoForm";
import { findAllClientes } from "@/features/clientes/repository";
import { findAllColaboradores } from "@/features/colaboradores/repository";
import { findAllServicos } from "@/features/servicos/repository";
import { TENANT_ID } from "@/constants";
import { serializeDecimal } from "@/lib/utils";

export default async function NovoAgendamentoPage() {
  const [clientes, colaboradores, servicosRaw] = await Promise.all([
    findAllClientes(TENANT_ID),
    findAllColaboradores(TENANT_ID),
    findAllServicos(TENANT_ID),
  ]);

  const servicosAtivos = serializeDecimal(servicosRaw.filter((s) => s.isActive));

  return (
    <div>
      <Header
        title="Novo Agendamento"
        description="Agende uma consulta ou sessão"
      />
      <div className="p-6">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Dados do Agendamento</CardTitle>
          </CardHeader>
          <CardContent>
            <AgendamentoForm
              clientes={clientes}
              colaboradores={colaboradores}
              servicos={servicosAtivos}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

