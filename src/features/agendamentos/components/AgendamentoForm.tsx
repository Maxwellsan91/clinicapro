"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { createAgendamentoAction, updateAgendamentoAction } from "../actions";
import { APPOINTMENT_STATUS_VALUES } from "../schema";
import type { Client, Collaborator, Service, Appointment } from "@prisma/client";

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendado",
  completed: "Concluído",
  cancelled: "Cancelado",
  no_show: "Não compareceu",
};

type AgendamentoWithRelations = Appointment & {
  client: Pick<Client, "id" | "name">;
  collaborator: Pick<Collaborator, "id" | "name">;
  service: Pick<Service, "id" | "name">;
};

interface AgendamentoFormProps {
  agendamento?: AgendamentoWithRelations;
  clientes: Pick<Client, "id" | "name">[];
  colaboradores: Pick<Collaborator, "id" | "name" | "role">[];
  servicos: Pick<Service, "id" | "name" | "duration">[];
}

function formatDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

export function AgendamentoForm({
  agendamento,
  clientes,
  colaboradores,
  servicos,
}: AgendamentoFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!agendamento;

  const action = isEditing
    ? updateAgendamentoAction.bind(null, agendamento.id)
    : createAgendamentoAction;

  return (
    <form action={action as (formData: FormData) => void} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cliente */}
        <div className="space-y-1.5">
          <Label htmlFor="clientId">Cliente *</Label>
          <Select
            id="clientId"
            name="clientId"
            defaultValue={agendamento?.clientId ?? ""}
            required
          >
            <option value="">Selecione um cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Colaborador */}
        <div className="space-y-1.5">
          <Label htmlFor="collaboratorId">Colaborador *</Label>
          <Select
            id="collaboratorId"
            name="collaboratorId"
            defaultValue={agendamento?.collaboratorId ?? ""}
            required
          >
            <option value="">Selecione um colaborador</option>
            {colaboradores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.role}
              </option>
            ))}
          </Select>
        </div>

        {/* Serviço */}
        <div className="space-y-1.5">
          <Label htmlFor="serviceId">Serviço *</Label>
          <Select
            id="serviceId"
            name="serviceId"
            defaultValue={agendamento?.serviceId ?? ""}
            required
          >
            <option value="">Selecione um serviço</option>
            {servicos.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.duration} min)
              </option>
            ))}
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            name="status"
            defaultValue={agendamento?.status ?? "scheduled"}
          >
            {APPOINTMENT_STATUS_VALUES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>

        {/* Início */}
        <div className="space-y-1.5">
          <Label htmlFor="startDateTime">Início *</Label>
          <Input
            id="startDateTime"
            name="startDateTime"
            type="datetime-local"
            defaultValue={
              agendamento?.startDateTime
                ? formatDatetimeLocal(new Date(agendamento.startDateTime))
                : ""
            }
            required
          />
        </div>

        {/* Término */}
        <div className="space-y-1.5">
          <Label htmlFor="endDateTime">Término *</Label>
          <Input
            id="endDateTime"
            name="endDateTime"
            type="datetime-local"
            defaultValue={
              agendamento?.endDateTime
                ? formatDatetimeLocal(new Date(agendamento.endDateTime))
                : ""
            }
            required
          />
        </div>
      </div>

      {/* Observações */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={agendamento?.notes ?? ""}
          placeholder="Informações adicionais sobre o agendamento..."
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Salvando..."
            : isEditing
            ? "Salvar Alterações"
            : "Criar Agendamento"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/agendamentos")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
