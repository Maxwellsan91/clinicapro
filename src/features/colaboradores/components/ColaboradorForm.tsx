"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createColaboradorAction, updateColaboradorAction } from "../actions";
import { COLLABORATOR_ROLES } from "@/constants";
import type { Collaborator } from "@prisma/client";

interface ColaboradorFormProps {
  colaborador?: Collaborator;
}

export function ColaboradorForm({ colaborador }: ColaboradorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!colaborador;

  const action = isEditing
    ? updateColaboradorAction.bind(null, colaborador.id)
    : createColaboradorAction;

  return (
    <form action={action as (formData: FormData) => void} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome *</Label>
          <Input id="name" name="name" defaultValue={colaborador?.name} required placeholder="Nome completo" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" defaultValue={colaborador?.email ?? ""} placeholder="email@exemplo.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" name="phone" defaultValue={colaborador?.phone ?? ""} placeholder="(11) 99999-9999" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="role">Cargo *</Label>
          <Select id="role" name="role" defaultValue={colaborador?.role} required>
            <option value="">Selecione um cargo</option>
            {COLLABORATOR_ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="specialty">Especialidade</Label>
          <Input id="specialty" name="specialty" defaultValue={colaborador?.specialty ?? ""} placeholder="Ex: Pilates funcional, Fisioterapia ortopédica..." />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : isEditing ? "Salvar Alterações" : "Criar Colaborador"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/colaboradores")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

