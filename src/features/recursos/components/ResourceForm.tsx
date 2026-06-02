"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createRecursoAction, updateRecursoAction } from "../actions";
import { RESOURCE_TYPES, RESOURCE_TYPE_LABELS } from "../schema";
import type { Resource } from "@prisma/client";

interface ResourceFormProps {
  recurso?: Resource;
}

export function ResourceForm({ recurso }: ResourceFormProps) {
  const router = useRouter();
  const [isPending] = useTransition();
  const isEditing = !!recurso;

  const action = isEditing
    ? updateRecursoAction.bind(null, recurso.id)
    : createRecursoAction;

  return (
    <form action={action as (formData: FormData) => void} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nome */}
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={recurso?.name}
            required
            placeholder="Ex: Gabinete Fisio 1"
          />
        </div>

        {/* Tipo */}
        <div className="space-y-1.5">
          <Label htmlFor="type">Tipo *</Label>
          <Select id="type" name="type" defaultValue={recurso?.type ?? "room"} required>
            {RESOURCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {RESOURCE_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </div>

        {/* Capacidade */}
        <div className="space-y-1.5">
          <Label htmlFor="capacity">Capacidade (pessoas)</Label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            defaultValue={recurso?.capacity ?? 1}
            placeholder="1"
          />
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <Label htmlFor="isActive">Status</Label>
          <Select
            id="isActive"
            name="isActive"
            defaultValue={recurso?.isActive === false ? "false" : "true"}
          >
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </Select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Salvando..."
            : isEditing
            ? "Salvar Alterações"
            : "Criar Recurso"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/recursos")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

