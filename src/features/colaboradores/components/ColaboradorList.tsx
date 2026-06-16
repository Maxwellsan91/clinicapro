"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { deleteColaboradorAction, restoreColaboradorAction } from "../actions";
import { RestoreButton } from "@/components/ui/RestoreButton";
import { Edit, Trash2, Eye } from "lucide-react";
import type { SerializedCollaborator } from "@/lib/serializers";

function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button variant="ghost" size="icon" disabled={isPending}
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
      onClick={() => {
        if (!confirm("Tem a certeza que pretende eliminar este colaborador?")) return;
        startTransition(async () => { await deleteColaboradorAction(id); });
      }}>
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}

export function ColaboradorList({ colaboradores, showDeleted = false }: { colaboradores: SerializedCollaborator[]; showDeleted?: boolean }) {
  if (colaboradores.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium">{showDeleted ? "Nenhum colaborador eliminado" : "Nenhum colaborador encontrado"}</p>
        <p className="text-sm mt-1">{showDeleted ? "" : "Adicione colaboradores à sua equipe"}</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Cargo</TableHead>
          <TableHead>Especialidade</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {colaboradores.map((col) => (
          <TableRow key={col.id} className={col.isDeleted ? "opacity-60 bg-red-50/30" : ""}>
            <TableCell className="font-medium">{col.name}</TableCell>
            <TableCell><Badge variant="secondary">{col.role}</Badge></TableCell>
            <TableCell className="text-gray-500">{col.specialty || "—"}</TableCell>
            <TableCell className="text-gray-500">{col.email || "—"}</TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                {col.isDeleted ? (
                  <RestoreButton onRestore={() => restoreColaboradorAction(col.id)} />
                ) : (
                  <>
                    <Link href={`/colaboradores/${col.id}`}>
                      <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                    </Link>
                    <Link href={`/colaboradores/${col.id}/editar`}>
                      <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                    </Link>
                    <DeleteButton id={col.id} />
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
