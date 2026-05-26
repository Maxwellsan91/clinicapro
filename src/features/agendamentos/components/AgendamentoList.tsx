"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { deleteAgendamentoAction, cancelAgendamentoAction } from "../actions";
import { StatusBadge } from "./StatusBadge";
import { Edit, Trash2, XCircle, Clock } from "lucide-react";
import type { Appointment, Client, Collaborator, Service } from "@prisma/client";

type AgendamentoWithRelations = Appointment & {
  client: Pick<Client, "id" | "name">;
  collaborator: Pick<Collaborator, "id" | "name">;
  service: Pick<Service, "id" | "name" | "duration">;
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function CancelButton({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  if (status === "cancelled" || status === "completed") return null;
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={isPending}
      className="text-orange-500 hover:text-orange-700 hover:bg-orange-50"
      title="Cancelar agendamento"
      onClick={() => {
        if (!confirm("Tem a certeza que pretende cancelar este agendamento?")) return;
        startTransition(async () => {
          await cancelAgendamentoAction(id);
        });
      }}
    >
      <XCircle className="w-4 h-4" />
    </Button>
  );
}

function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={isPending}
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
      title="Excluir agendamento"
      onClick={() => {
        if (!confirm("Tem a certeza que pretende eliminar este agendamento?")) return;
        startTransition(async () => {
          await deleteAgendamentoAction(id);
        });
      }}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}

interface AgendamentoListProps {
  agendamentos: AgendamentoWithRelations[];
}

export function AgendamentoList({ agendamentos }: AgendamentoListProps) {
  if (agendamentos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium">Nenhum agendamento encontrado</p>
        <p className="text-sm mt-1">Comece criando um novo agendamento</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Início</TableHead>
          <TableHead>Término</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Colaborador</TableHead>
          <TableHead>Serviço</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {agendamentos.map((a) => (
          <TableRow key={a.id}>
            <TableCell className="font-medium whitespace-nowrap">
              {formatDateTime(a.startDateTime)}
            </TableCell>
            <TableCell className="text-gray-500 whitespace-nowrap">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(a.endDateTime)}
              </span>
            </TableCell>
            <TableCell>{a.client.name}</TableCell>
            <TableCell className="text-gray-500">{a.collaborator.name}</TableCell>
            <TableCell className="text-gray-500">
              {a.service.name}
              <span className="text-xs text-gray-400 ml-1">
                ({a.service.duration} min)
              </span>
            </TableCell>
            <TableCell>
              <StatusBadge status={a.status} />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Link href={`/agendamentos/${a.id}/editar`}>
                  <Button variant="ghost" size="icon" title="Editar">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                <CancelButton id={a.id} status={a.status} />
                <DeleteButton id={a.id} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
