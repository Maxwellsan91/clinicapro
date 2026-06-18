export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { TENANT_ID } from "@/constants";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { findAllServicos } from "@/features/servicos/repository";
import { findAllColaboradores } from "@/features/colaboradores/repository";
import { findActiveRecursos } from "@/features/recursos/repository";
import { getPilatesClassById } from "@/features/pilates-turmas/repository";
import { PilatesClassForm } from "@/features/pilates-turmas/components/PilatesClassForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarTurmaPilatesPage({ params }: Props) {
  const { id } = await params;
  const [pilatesClass, services, collaborators, resources] = await Promise.all([
    getPilatesClassById(id, TENANT_ID),
    findAllServicos(TENANT_ID),
    findAllColaboradores(TENANT_ID),
    findActiveRecursos(TENANT_ID),
  ]);
  if (!pilatesClass) notFound();

  const serviceOptions = services
    .filter((service) => service.isActive)
    .map((service) => ({ id: service.id, name: service.name }));
  const collaboratorOptions = collaborators.map((collaborator) => ({
    id: collaborator.id,
    name: collaborator.name,
  }));
  const resourceOptions = resources.map((resource) => ({
    id: resource.id,
    name: resource.name,
  }));

  return (
    <div>
      <Header title="Editar Turma de Pilates" description={`Editando: ${pilatesClass.name}`} />
      <div className="p-6">
        <Card className="max-w-4xl">
          <CardHeader><CardTitle>Dados da turma</CardTitle></CardHeader>
          <CardContent>
            <PilatesClassForm
              pilatesClass={pilatesClass}
              services={serviceOptions}
              collaborators={collaboratorOptions}
              resources={resourceOptions}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
