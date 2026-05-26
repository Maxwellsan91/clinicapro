"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { createServicoAction, updateServicoAction } from "../actions";
import { SERVICE_CATEGORIES } from "@/constants";
import type { Service } from "@prisma/client";

interface ServicoFormProps {
  servico?: Service;
}

export function ServicoForm({ servico }: ServicoFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!servico;

  const action = isEditing
    ? updateServicoAction.bind(null, servico.id)
    : createServicoAction;

  return (
    <form action={action as (formData: FormData) => void} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome *</Label>
          <Input id="name" name="name" defaultValue={servico?.name} required placeholder="Ex: Fisioterapia Ortopédica" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">Categoria</Label>
          <Select id="category" name="category" defaultValue={servico?.category ?? ""}>
            <option value="">Selecione uma categoria</option>
            {SERVICE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="duration">Duração (minutos) *</Label>
          <Input id="duration" name="duration" type="number" min={1} defaultValue={servico?.duration} required placeholder="60" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price">Preço (€) *</Label>
          <Input id="price" name="price" type="number" step="0.01" min={0} defaultValue={servico?.price.toString()} required placeholder="150.00" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="isActive">Status</Label>
          <Select id="isActive" name="isActive" defaultValue={servico?.isActive === false ? "false" : "true"}>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" name="description" defaultValue={servico?.description ?? ""} placeholder="Descreva o serviço..." rows={3} />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : isEditing ? "Salvar Alterações" : "Criar Serviço"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/servicos")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

