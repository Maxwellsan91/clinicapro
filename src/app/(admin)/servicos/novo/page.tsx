import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServicoForm } from "@/features/servicos/components/ServicoForm";

export default function NovoServicoPage() {
  return (
    <div>
      <Header title="Novo Serviço" description="Adicione um serviço à clínica" />
      <div className="p-6">
        <Card className="max-w-2xl">
          <CardHeader><CardTitle>Dados do Serviço</CardTitle></CardHeader>
          <CardContent><ServicoForm /></CardContent>
        </Card>
      </div>
    </div>
  );
}

