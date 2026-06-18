"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Edit, Eye, Power, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deletePilatesClassAction, togglePilatesClassStatusAction } from "../actions";
import { formatScheduleLabel } from "../schema";
import type { PilatesClassView, PilatesScheduleView } from "../types";

interface Props {
  classes: PilatesClassView[];
}

export function PilatesClassList({ classes }: Props) {
  const [isPending, startTransition] = useTransition();

  if (classes.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p className="text-lg font-medium">Nenhuma turma de Pilates encontrada</p>
        <p className="mt-1 text-sm">Crie a primeira turma e configure capacidade, horários e vagas.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Turma</TableHead>
          <TableHead>Horários</TableHead>
          <TableHead>Instrutor</TableHead>
          <TableHead>Sala/Recurso</TableHead>
          <TableHead>Capacidade</TableHead>
          <TableHead>Ocupação</TableHead>
          <TableHead>Vagas</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {classes.map((pilatesClass) => {
          const totalOccupied = Object.values(pilatesClass.occupancyBySchedule ?? {}).reduce((sum: number, count) => sum + Number(count), 0);
          const totalSlots = pilatesClass.capacity * pilatesClass.schedules.length;
          const free = Math.max(totalSlots - totalOccupied, 0);
          return (
            <TableRow key={pilatesClass.id}>
              <TableCell className="font-medium">{pilatesClass.name}</TableCell>
              <TableCell className="max-w-[260px] text-gray-600">
                {pilatesClass.schedules.map((schedule: PilatesScheduleView) => formatScheduleLabel(schedule)).join(" / ")}
              </TableCell>
              <TableCell className="text-gray-600">{pilatesClass.collaborator?.name ?? "-"}</TableCell>
              <TableCell className="text-gray-600">{pilatesClass.resource?.name ?? "-"}</TableCell>
              <TableCell>{pilatesClass.capacity}</TableCell>
              <TableCell>{totalOccupied}/{totalSlots}</TableCell>
              <TableCell className="text-green-700 font-medium">{free}</TableCell>
              <TableCell>
                <Badge variant={pilatesClass.isActive ? "success" : "secondary"}>
                  {pilatesClass.isActive ? "Ativa" : "Inativa"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/pilates/turmas/${pilatesClass.id}`}>
                    <Button variant="ghost" size="icon" aria-label="Ver turma"><Eye className="w-4 h-4" /></Button>
                  </Link>
                  <Link href={`/pilates/turmas/${pilatesClass.id}/editar`}>
                    <Button variant="ghost" size="icon" aria-label="Editar turma"><Edit className="w-4 h-4" /></Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
                    aria-label="Alterar estado"
                    onClick={() => startTransition(() => { void togglePilatesClassStatusAction(pilatesClass.id, !pilatesClass.isActive); })}
                  >
                    <Power className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    aria-label="Eliminar turma"
                    onClick={() => {
                      if (!confirm("Eliminar esta turma? Turmas com alunos ativos serão bloqueadas.")) return;
                      startTransition(() => { void deletePilatesClassAction(pilatesClass.id); });
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
