import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClienteForm } from "@/features/clientes/components/ClienteForm";

export default function NovoClientePage() {
  return (
    <div>
      <Header title="Novo Cliente" description="Adicione um novo cliente à clínica" />
      <div className="p-6">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <ClienteForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

