"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { deleteClienteAction, restoreClienteAction } from "../actions";
import { RestoreButton } from "@/components/ui/RestoreButton";
import { formatDate } from "@/lib/utils";
import { Edit, Trash2, Eye } from "lucide-react";
import type { Client } from "@prisma/client";

interface ClienteListProps {
  clientes: Client[];
  showDeleted?: boolean;
}

function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button variant="ghost" size="icon" onClick={() => {
      if (!confirm("Tem a certeza que pretende eliminar este utente?")) return;
      startTransition(async () => { await deleteClienteAction(id); });
    }} disabled={isPending} className="text-red-500 hover:text-red-700 hover:bg-red-50">
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}

export function ClienteList({ clientes, showDeleted = false }: ClienteListProps) {
  if (clientes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium">{showDeleted ? "Nenhum utente eliminado" : "Nenhum utente encontrado"}</p>
        <p className="text-sm mt-1">{showDeleted ? "" : "Comece por adicionar o primeiro utente"}</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>{showDeleted ? "Eliminado em" : "Registado em"}</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clientes.map((cliente) => (
          <TableRow key={cliente.id} className={cliente.isDeleted ? "opacity-60 bg-red-50/30" : ""}>
            <TableCell className="font-medium">
              <Link href={`/clientes/${cliente.id}`} className="hover:underline text-blue-600">
                {cliente.name}
              </Link>
            </TableCell>
            <TableCell className="text-gray-500">{cliente.email || "—"}</TableCell>
            <TableCell className="text-gray-500">{cliente.phone || "—"}</TableCell>
            <TableCell className="text-gray-500">
              {cliente.isDeleted
                ? (cliente.deletedAt ? formatDate(cliente.deletedAt) : "—")
                : formatDate(cliente.createdAt)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                {cliente.isDeleted ? (
                  <RestoreButton onRestore={() => restoreClienteAction(cliente.id)} />
                ) : (
                  <>
                    <Link href={`/clientes/${cliente.id}`}>
                      <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                    </Link>
                    <Link href={`/clientes/${cliente.id}/editar`}>
                      <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                    </Link>
                    <DeleteButton id={cliente.id} />
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
