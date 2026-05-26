"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { deleteColaboradorAction } from "../actions";
import { formatDate } from "@/lib/utils";
import { Edit, Trash2, Eye } from "lucide-react";
import type { Collaborator } from "@prisma/client";

function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost" size="icon"
      disabled={isPending}
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
      onClick={() => {
        if (!confirm("Tem certeza que deseja excluir este colaborador?")) return;
        startTransition(async () => { await deleteColaboradorAction(id); });
      }}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}

export function ColaboradorList({ colaboradores }: { colaboradores: Collaborator[] }) {
  if (colaboradores.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium">Nenhum colaborador encontrado</p>
        <p className="text-sm mt-1">Adicione colaboradores à sua equipe</p>
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
          <TableRow key={col.id}>
            <TableCell className="font-medium">{col.name}</TableCell>
            <TableCell><Badge variant="secondary">{col.role}</Badge></TableCell>
            <TableCell className="text-gray-500">{col.specialty || "—"}</TableCell>
            <TableCell className="text-gray-500">{col.email || "—"}</TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Link href={`/colaboradores/${col.id}`}>
                  <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                </Link>
                <Link href={`/colaboradores/${col.id}/editar`}>
                  <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                </Link>
                <DeleteButton id={col.id} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

