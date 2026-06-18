import { TENANT_ID } from "@/constants";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { findAllServicos } from "@/features/servicos/repository";
import { findAllColaboradores } from "@/features/colaboradores/repository";
import { findActiveRecursos } from "@/features/recursos/repository";
import { PilatesClassForm } from "@/features/pilates-turmas/components/PilatesClassForm";

export default async function NovaTurmaPilatesPage() {
  const [services, collaborators, resources] = await Promise.all([
    findAllServicos(TENANT_ID),
    findAllColaboradores(TENANT_ID),
    findActiveRecursos(TENANT_ID),
  ]);

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
      <Header title="Nova Turma de Pilates" description="Configure capacidade, horários e recursos da turma" />
      <div className="p-6">
        <Card className="max-w-4xl">
          <CardHeader><CardTitle>Dados da turma</CardTitle></CardHeader>
          <CardContent>
            <PilatesClassForm
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
