"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { RestoreButton } from "@/components/ui/RestoreButton";
import { deleteRecursoAction, restoreRecursoAction } from "../actions";
import { RESOURCE_TYPE_LABELS, type ResourceType } from "../schema";
import { Edit, Trash2, DoorOpen, Dumbbell, TreePine } from "lucide-react";
import type { Resource } from "@prisma/client";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  room:      <DoorOpen className="w-3.5 h-3.5" />,
  equipment: <Dumbbell className="w-3.5 h-3.5" />,
  gym:       <TreePine className="w-3.5 h-3.5" />,
};

function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={isPending}
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
      onClick={() => {
        if (!confirm("Tem a certeza que pretende eliminar este recurso?")) return;
        startTransition(async () => {
          await deleteRecursoAction(id);
        });
      }}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}

export function ResourceList({
  recursos,
  showDeleted = false,
}: {
  recursos: Resource[];
  showDeleted?: boolean;
}) {
  if (recursos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium">
          {showDeleted ? "Nenhum recurso eliminado" : "Nenhum recurso encontrado"}
        </p>
        <p className="text-sm mt-1">
          {showDeleted ? "" : "Adicione salas, gabinetes e equipamentos da clínica"}
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Capacidade</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recursos.map((r) => (
          <TableRow
            key={r.id}
            className={r.isDeleted ? "opacity-60 bg-red-50/30" : ""}
          >
            <TableCell className="font-medium">{r.name}</TableCell>
            <TableCell>
              <span className="inline-flex items-center gap-1.5 text-gray-600">
                {TYPE_ICONS[r.type]}
                {RESOURCE_TYPE_LABELS[r.type as ResourceType] ?? r.type}
              </span>
            </TableCell>
            <TableCell className="text-gray-500">
              {r.capacity} pessoa{r.capacity !== 1 ? "s" : ""}
            </TableCell>
            <TableCell>
              {r.isDeleted ? (
                <Badge variant="destructive">Eliminado</Badge>
              ) : (
                <Badge variant={r.isActive ? "success" : "secondary"}>
                  {r.isActive ? "Ativo" : "Inativo"}
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                {r.isDeleted ? (
                  <RestoreButton onRestore={() => restoreRecursoAction(r.id)} />
                ) : (
                  <>
                    <Link href={`/recursos/${r.id}/editar`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <DeleteButton id={r.id} />
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

