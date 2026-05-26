"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { deleteClienteAction } from "../actions";
import { formatDate } from "@/lib/utils";
import { Edit, Trash2, Eye } from "lucide-react";
import type { Client } from "@prisma/client";

interface ClienteListProps {
  clientes: Client[];
}

function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;
    startTransition(async () => {
      await deleteClienteAction(id);
    });
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isPending} className="text-red-500 hover:text-red-700 hover:bg-red-50">
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}

export function ClienteList({ clientes }: ClienteListProps) {
  if (clientes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium">Nenhum cliente encontrado</p>
        <p className="text-sm mt-1">Comece adicionando seu primeiro cliente</p>
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
          <TableHead>Cadastrado em</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clientes.map((cliente) => (
          <TableRow key={cliente.id}>
            <TableCell className="font-medium">{cliente.name}</TableCell>
            <TableCell className="text-gray-500">{cliente.email || "—"}</TableCell>
            <TableCell className="text-gray-500">{cliente.phone || "—"}</TableCell>
            <TableCell className="text-gray-500">{formatDate(cliente.createdAt)}</TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Link href={`/clientes/${cliente.id}`}>
                  <Button variant="ghost" size="icon">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href={`/clientes/${cliente.id}/editar`}>
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                <DeleteButton id={cliente.id} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

