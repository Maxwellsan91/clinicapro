"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { deleteServicoAction, restoreServicoAction } from "../actions";
import { RestoreButton } from "@/components/ui/RestoreButton";
import { formatCurrency } from "@/lib/utils";
import { Edit, Trash2, Eye } from "lucide-react";
import type { Service } from "@prisma/client";

function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button variant="ghost" size="icon" disabled={isPending}
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
      onClick={() => {
        if (!confirm("Tem a certeza que pretende eliminar este serviço?")) return;
        startTransition(async () => { await deleteServicoAction(id); });
      }}>
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}

export function ServicoList({ servicos, showDeleted = false }: { servicos: Service[]; showDeleted?: boolean }) {
  if (servicos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium">{showDeleted ? "Nenhum serviço eliminado" : "Nenhum serviço encontrado"}</p>
        <p className="text-sm mt-1">{showDeleted ? "" : "Adicione os serviços oferecidos pela clínica"}</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Duração</TableHead>
          <TableHead>Preço</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {servicos.map((s) => (
          <TableRow key={s.id} className={s.isDeleted ? "opacity-60 bg-red-50/30" : ""}>
            <TableCell className="font-medium">{s.name}</TableCell>
            <TableCell className="text-gray-500">{s.category || "—"}</TableCell>
            <TableCell className="text-gray-500">{s.duration} min</TableCell>
            <TableCell className="font-medium">{formatCurrency(Number(s.price))}</TableCell>
            <TableCell>
              {s.isDeleted
                ? <Badge variant="destructive">Eliminado</Badge>
                : <Badge variant={s.isActive ? "success" : "secondary"}>{s.isActive ? "Ativo" : "Inativo"}</Badge>}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                {s.isDeleted ? (
                  <RestoreButton onRestore={() => restoreServicoAction(s.id)} />
                ) : (
                  <>
                    <Link href={`/servicos/${s.id}`}>
                      <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                    </Link>
                    <Link href={`/servicos/${s.id}/editar`}>
                      <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                    </Link>
                    <DeleteButton id={s.id} />
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
