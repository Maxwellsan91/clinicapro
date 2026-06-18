export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit } from "lucide-react";
import { TENANT_ID } from "@/constants";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { findAllClientes } from "@/features/clientes/repository";
import { getPilatesClassById } from "@/features/pilates-turmas/repository";
import { PilatesClassEnrollmentModal } from "@/features/pilates-turmas/components/PilatesClassEnrollmentModal";
import { PilatesClassGrid } from "@/features/pilates-turmas/components/PilatesClassGrid";
import { PilatesClassLegend } from "@/features/pilates-turmas/components/PilatesClassLegend";
import { PilatesClassSummaryCards } from "@/features/pilates-turmas/components/PilatesClassSummaryCards";
import { formatScheduleLabel } from "@/features/pilates-turmas/schema";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TurmaPilatesDetailPage({ params }: Props) {
  const { id } = await params;
  const [pilatesClass, clients] = await Promise.all([
    getPilatesClassById(id, TENANT_ID),
    findAllClientes(TENANT_ID),
  ]);
  if (!pilatesClass) notFound();

  const clientOptions = clients.map((client) => ({
    id: client.id,
    name: client.name,
  }));
  const totalOccupied = Object.values(pilatesClass.occupancyBySchedule).reduce((sum, count) => sum + Number(count), 0);

  return (
    <div>
      <Header title={pilatesClass.name} description="Grelha de vagas por horário configurado" />
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant={pilatesClass.isActive ? "success" : "secondary"}>{pilatesClass.isActive ? "Ativa" : "Inativa"}</Badge>
            <span className="text-sm text-gray-500">{pilatesClass.service?.name ?? "Sem serviço associado"}</span>
          </div>
          <div className="flex gap-2">
            <PilatesClassEnrollmentModal pilatesClass={pilatesClass} clients={clientOptions} />
            <Link href={`/pilates/turmas/${pilatesClass.id}/editar`}>
              <Button variant="outline"><Edit className="w-4 h-4" />Editar</Button>
            </Link>
          </div>
        </div>

        <PilatesClassSummaryCards
          capacity={pilatesClass.capacity}
          schedulesCount={pilatesClass.schedules.length}
          totalOccupied={totalOccupied}
          isActive={pilatesClass.isActive}
        />

        <Card>
          <CardHeader><CardTitle>Configuração</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><p className="text-gray-500">Instrutor</p><p className="font-medium">{pilatesClass.collaborator?.name ?? "-"}</p></div>
            <div><p className="text-gray-500">Sala/Recurso</p><p className="font-medium">{pilatesClass.resource?.name ?? "-"}</p></div>
            <div className="md:col-span-2"><p className="text-gray-500">Horários</p><p className="font-medium">{pilatesClass.schedules.map((schedule) => formatScheduleLabel(schedule)).join(" / ")}</p></div>
            {pilatesClass.notes && <div className="md:col-span-2"><p className="text-gray-500">Observações</p><p className="font-medium whitespace-pre-wrap">{pilatesClass.notes}</p></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Grelha de vagas</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <PilatesClassGrid pilatesClass={pilatesClass} />
            <PilatesClassLegend />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
