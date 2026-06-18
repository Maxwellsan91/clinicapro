"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createPilatesClassAction, updatePilatesClassAction } from "../actions";
import { PilatesClassScheduleEditor, type ScheduleDraft } from "./PilatesClassScheduleEditor";
import type { ActionResult, PilatesClassView, PilatesScheduleView } from "../types";

interface Option {
  id: string;
  name: string;
}

interface Props {
  pilatesClass?: PilatesClassView;
  services: Option[];
  collaborators: Option[];
  resources: Option[];
}

export function PilatesClassForm({ pilatesClass, services, collaborators, resources }: Props) {
  const router = useRouter();
  const isEditing = !!pilatesClass;
  const [error, setError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<ScheduleDraft[]>(
    pilatesClass?.schedules?.map((schedule: PilatesScheduleView) => ({
      id: schedule.id,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      duration: schedule.duration,
    })) ?? [{ dayOfWeek: 1, startTime: "19:15", duration: 50 }]
  );

  const action = isEditing
    ? updatePilatesClassAction.bind(null, pilatesClass.id)
    : createPilatesClassAction;

  const schedulesJson = useMemo(() => JSON.stringify(schedules), [schedules]);

  async function submit(formData: FormData) {
    setError(null);
    formData.set("schedules", schedulesJson);
    const result = await action(formData) as ActionResult | undefined;
    if (result?.success === false) {
      const errors = typeof result.error === "string" ? { _global: [result.error] } : result.error;
      const global = errors?._global?.[0];
      const firstField = Object.values(errors ?? {}).flat()[0];
      setError(String(global ?? firstField ?? "Verifique os dados do formulário."));
    }
  }

  return (
    <form action={submit} className="space-y-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <input type="hidden" name="schedules" value={schedulesJson} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="name">Nome da turma *</Label>
          <Input id="name" name="name" defaultValue={pilatesClass?.name} required placeholder="Ex: Turma 1" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="serviceId">Serviço</Label>
          <Select id="serviceId" name="serviceId" defaultValue={pilatesClass?.serviceId ?? ""}>
            <option value="">Sem serviço associado</option>
            {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="collaboratorId">Instrutor responsável</Label>
          <Select id="collaboratorId" name="collaboratorId" defaultValue={pilatesClass?.collaboratorId ?? ""}>
            <option value="">Sem instrutor associado</option>
            {collaborators.map((collaborator) => <option key={collaborator.id} value={collaborator.id}>{collaborator.name}</option>)}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="resourceId">Sala/Recurso</Label>
          <Select id="resourceId" name="resourceId" defaultValue={pilatesClass?.resourceId ?? ""}>
            <option value="">Sem recurso associado</option>
            {resources.map((resource) => <option key={resource.id} value={resource.id}>{resource.name}</option>)}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="capacity">Capacidade máxima *</Label>
          <Input id="capacity" name="capacity" type="number" min={1} defaultValue={pilatesClass?.capacity ?? 10} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="isActive">Estado</Label>
          <Select id="isActive" name="isActive" defaultValue={pilatesClass?.isActive === false ? "false" : "true"}>
            <option value="true">Ativa</option>
            <option value="false">Inativa</option>
          </Select>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea id="notes" name="notes" defaultValue={pilatesClass?.notes ?? ""} rows={3} />
        </div>
      </div>

      <PilatesClassScheduleEditor schedules={schedules} onChange={setSchedules} />

      <div className="flex gap-3 pt-2">
        <Button type="submit">{isEditing ? "Guardar alterações" : "Criar turma"}</Button>
        <Button type="button" variant="outline" onClick={() => router.push(isEditing ? `/pilates/turmas/${pilatesClass.id}` : "/pilates/turmas")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
