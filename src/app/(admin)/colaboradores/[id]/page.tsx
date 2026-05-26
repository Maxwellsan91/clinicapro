export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { findColaboradorById } from "@/features/colaboradores/repository";
import { TENANT_ID } from "@/constants";
import { formatDate } from "@/lib/utils";
import { Edit, ArrowLeft } from "lucide-react";

interface Props { params: Promise<{ id: string }> }

export default async function ColaboradorDetailPage({ params }: Props) {
  const { id } = await params;
  const col = await findColaboradorById(id, TENANT_ID);
  if (!col) notFound();

  return (
    <div>
      <Header title={col.name} description="Detalhes do colaborador" />
      <div className="p-6 space-y-4">
        <div className="flex gap-3">
          <Link href="/colaboradores"><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button></Link>
          <Link href={`/colaboradores/${id}/editar`}><Button size="sm"><Edit className="w-4 h-4 mr-2" />Editar</Button></Link>
        </div>
        <Card className="max-w-2xl">
          <CardHeader><CardTitle>Informações do Colaborador</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              {[["Nome", col.name], ["E-mail", col.email || "—"], ["Telefone", col.phone || "—"], ["Cadastrado em", formatDate(col.createdAt)]].map(([label, value]) => (
                <div key={label} className="space-y-1">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</dt>
                  <dd className="text-sm text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex gap-2">
              <Badge variant="secondary">{col.role}</Badge>
              {col.specialty && <Badge variant="outline">{col.specialty}</Badge>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

