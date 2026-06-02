import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResourceForm } from "@/features/recursos/components/ResourceForm";

export default function NovoRecursoPage() {
  return (
    <div>
      <Header title="Novo Recurso" description="Adicione uma sala, gabinete ou equipamento" />
      <div className="p-6">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Dados do Recurso</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

