export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { findClienteById } from "@/features/clientes/repository";
import { TENANT_ID } from "@/constants";
import { formatDate } from "@/lib/utils";
import { Edit, ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClienteDetailPage({ params }: Props) {
  const { id } = await params;
  const cliente = await findClienteById(id, TENANT_ID);

  if (!cliente) notFound();

  return (
    <div>
      <Header title={cliente.name} description="Detalhes do cliente" />
      <div className="p-6 space-y-4">
        <div className="flex gap-3">
          <Link href="/clientes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <Link href={`/clientes/${id}/editar`}>
            <Button size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              {[
                ["Nome", cliente.name],
                ["E-mail", cliente.email || "—"],
                ["Telefone", cliente.phone || "—"],
                ["CPF", cliente.cpf || "—"],
                ["Data de Nascimento", cliente.birthDate ? formatDate(cliente.birthDate) : "—"],
                ["Endereço", cliente.address || "—"],
                ["Cadastrado em", formatDate(cliente.createdAt)],
              ].map(([label, value]) => (
                <div key={label} className="space-y-1">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</dt>
                  <dd className="text-sm text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
            {cliente.notes && (
              <div className="mt-4 space-y-1">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Observações</dt>
                <dd className="text-sm text-gray-900">{cliente.notes}</dd>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

