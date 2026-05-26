export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { findServicoById } from "@/features/servicos/repository";
import { TENANT_ID } from "@/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Edit, ArrowLeft } from "lucide-react";

interface Props { params: Promise<{ id: string }> }

export default async function ServicoDetailPage({ params }: Props) {
  const { id } = await params;
  const servico = await findServicoById(id, TENANT_ID);
  if (!servico) notFound();

  return (
    <div>
      <Header title={servico.name} description="Detalhes do serviço" />
      <div className="p-6 space-y-4">
        <div className="flex gap-3">
          <Link href="/servicos"><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button></Link>
          <Link href={`/servicos/${id}/editar`}><Button size="sm"><Edit className="w-4 h-4 mr-2" />Editar</Button></Link>
        </div>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {servico.name}
              <Badge variant={servico.isActive ? "success" : "secondary"}>
                {servico.isActive ? "Ativo" : "Inativo"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              {[
                ["Categoria", servico.category || "—"],
                ["Duração", `${servico.duration} minutos`],
                ["Preço", formatCurrency(Number(servico.price))],
                ["Cadastrado em", formatDate(servico.createdAt)],
              ].map(([label, value]) => (
                <div key={label} className="space-y-1">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</dt>
                  <dd className="text-sm text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
            {servico.description && (
              <div className="mt-4 space-y-1">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</dt>
                <dd className="text-sm text-gray-900">{servico.description}</dd>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

