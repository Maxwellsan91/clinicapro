"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClienteAction, updateClienteAction } from "../actions";
import type { Client } from "@prisma/client";

interface ClienteFormProps {
  cliente?: Client;
}

export function ClienteForm({ cliente }: ClienteFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!cliente;

  const action = isEditing
    ? updateClienteAction.bind(null, cliente.id)
    : createClienteAction;

  return (
    <form action={action as (formData: FormData) => void} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome *</Label>
          <Input id="name" name="name" defaultValue={cliente?.name} required placeholder="Nome completo" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" defaultValue={cliente?.email ?? ""} placeholder="email@exemplo.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" name="phone" defaultValue={cliente?.phone ?? ""} placeholder="(11) 99999-9999" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cpf">CPF</Label>
          <Input id="cpf" name="cpf" defaultValue={cliente?.cpf ?? ""} placeholder="000.000.000-00" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="birthDate">Data de Nascimento</Label>
          <Input
            id="birthDate"
            name="birthDate"
            type="date"
            defaultValue={cliente?.birthDate ? new Date(cliente.birthDate).toISOString().split("T")[0] : ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="address">Endereço</Label>
          <Input id="address" name="address" defaultValue={cliente?.address ?? ""} placeholder="Rua, número, bairro" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" name="notes" defaultValue={cliente?.notes ?? ""} placeholder="Informações adicionais..." rows={3} />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : isEditing ? "Salvar Alterações" : "Criar Cliente"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/clientes")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

