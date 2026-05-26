import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColaboradorForm } from "@/features/colaboradores/components/ColaboradorForm";

export default function NovoColaboradorPage() {
  return (
    <div>
      <Header title="Novo Colaborador" description="Adicione um colaborador à equipe" />
      <div className="p-6">
        <Card className="max-w-2xl">
          <CardHeader><CardTitle>Dados do Colaborador</CardTitle></CardHeader>
          <CardContent><ColaboradorForm /></CardContent>
        </Card>
      </div>
    </div>
  );
}

