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
import {
  deletePagamentoAction,
  markAsPaidAction,
  markAsPendingAction,
} from "../actions";
import { PaymentStatusBadge, InvoiceStatusBadge } from "./PaymentStatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Edit, Trash2, CheckCircle, RotateCcw, ExternalLink, FileText } from "lucide-react";
import type { Payment, Client, Appointment, Service } from "@prisma/client";

type PagamentoWithRelations = Payment & {
  client: Pick<Client, "id" | "name">;
  appointment:
    | (Pick<Appointment, "id" | "startDateTime"> & {
        service: Pick<Service, "id" | "name">;
      })
    | null;
};

function MarkPaidButton({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  if (status === "paid") return null;
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={isPending}
      className="text-green-600 hover:text-green-800 hover:bg-green-50"
      title="Marcar como pago"
      onClick={() => {
        startTransition(async () => {
          await markAsPaidAction(id);
        });
      }}
    >
      <CheckCircle className="w-4 h-4" />
    </Button>
  );
}

function MarkPendingButton({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  if (status !== "paid") return null;
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={isPending}
      className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50"
      title="Marcar como pendente"
      onClick={() => {
        startTransition(async () => {
          await markAsPendingAction(id);
        });
      }}
    >
      <RotateCcw className="w-4 h-4" />
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
      title="Eliminar pagamento"
      onClick={() => {
        if (!confirm("Tem a certeza que pretende eliminar este pagamento?"))
          return;
        startTransition(async () => {
          await deletePagamentoAction(id);
        });
      }}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}

interface PagamentoListProps {
  pagamentos: PagamentoWithRelations[];
}

export function PagamentoList({ pagamentos }: PagamentoListProps) {
  if (pagamentos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium">Nenhum pagamento encontrado</p>
        <p className="text-sm mt-1">Comece por registar o primeiro pagamento</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Utente</TableHead>
          <TableHead>Serviço / Sessão</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Fatura</TableHead>
          <TableHead className="text-right">Acções</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pagamentos.map((p) => (
          <TableRow key={p.id}>
            <TableCell>
              <div className="font-medium">{p.client.name}</div>
              {p.paidAt && (
                <div className="text-xs text-gray-400">
                  Pago em {formatDate(p.paidAt)}
                </div>
              )}
            </TableCell>
            <TableCell className="text-gray-500 text-sm">
              {p.appointment ? (
                <span>
                  {p.appointment.service.name}
                  <br />
                  <span className="text-xs text-gray-400">
                    {new Intl.DateTimeFormat("pt-PT", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }).format(new Date(p.appointment.startDateTime))}
                  </span>
                </span>
              ) : (
                <span className="text-gray-400 italic">Avulso</span>
              )}
            </TableCell>
            <TableCell className="font-semibold text-gray-900">
              {formatCurrency(Number(p.amount))}
            </TableCell>
            <TableCell className="text-sm text-gray-500">
              {p.dueDate ? (
                <span
                  className={
                    new Date(p.dueDate) < new Date() && p.status !== "paid"
                      ? "text-red-600 font-medium"
                      : ""
                  }
                >
                  {formatDate(p.dueDate)}
                </span>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell>
              <PaymentStatusBadge status={p.status} />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1.5">
                <InvoiceStatusBadge status={p.invoiceStatus} />
                {p.invoiceNumber && (
                  <span className="text-xs text-gray-500 font-mono">
                    {p.invoiceNumber}
                  </span>
                )}
                {p.invoiceExternalUrl && (
                  <a
                    href={p.invoiceExternalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Abrir fatura"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <MarkPaidButton id={p.id} status={p.status} />
                <MarkPendingButton id={p.id} status={p.status} />
                <Link href={`/pagamentos/${p.id}/editar`}>
                  <Button variant="ghost" size="icon" title="Editar">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                <DeleteButton id={p.id} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

