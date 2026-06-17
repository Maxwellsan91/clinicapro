"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
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
  restorePagamentoAction,
} from "../actions";
import { PaymentStatusBadge, InvoiceStatusBadge } from "./PaymentStatusBadge";
import {
  PagamentoDetailSheet,
  type PagamentoDetail,
} from "./PagamentoDetailSheet";
import { RestoreButton } from "@/components/ui/RestoreButton";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Edit,
  Trash2,
  CheckCircle,
  RotateCcw,
  ExternalLink,
  Clock,
  CreditCard,
} from "lucide-react";

// --- botões de acção inline ---

function MarkPaidButton({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  if (status === "paid") return null;
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={isPending}
      className="h-8 w-8 text-green-600 hover:text-green-800 hover:bg-green-50"
      title="Marcar como pago"
      onClick={(e) => { e.stopPropagation(); startTransition(async () => { await markAsPaidAction(id); }); }}
    >
      <CheckCircle className="w-3.5 h-3.5" />
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
      className="h-8 w-8 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50"
      title="Repor pendente"
      onClick={(e) => { e.stopPropagation(); startTransition(async () => { await markAsPendingAction(id); }); }}
    >
      <RotateCcw className="w-3.5 h-3.5" />
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
      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
      title="Eliminar"
      onClick={(e) => {
        e.stopPropagation();
        if (!confirm("Tem a certeza que pretende eliminar este pagamento?")) return;
        startTransition(async () => { await deletePagamentoAction(id); });
      }}
    >
      <Trash2 className="w-3.5 h-3.5" />
    </Button>
  );
}

// --- componente principal ---

interface PagamentoListProps {
  pagamentos: PagamentoDetail[];
  showDeleted?: boolean;
}

export function PagamentoList({ pagamentos, showDeleted = false }: PagamentoListProps) {
  const [selected, setSelected] = useState<PagamentoDetail | null>(null);

  if (pagamentos.length === 0) {
    return (
      <div className="text-center py-14 text-gray-400">
        <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-base font-medium text-gray-500">Nenhum pagamento encontrado</p>
        <p className="text-sm mt-1">Comece por registar o primeiro pagamento</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/80">
            <TableHead className="pl-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Utente
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Serviço / Sessão
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Valor
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Vencimento
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Estado
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Última alteração
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Fatura
            </TableHead>
            <TableHead className="text-right pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Acções
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pagamentos.map((p) => {
            const isOverdue =
              p.dueDate &&
              new Date(p.dueDate) < new Date() &&
              p.status !== "paid";

            return (
              <TableRow
                key={p.id}
                onClick={() => !showDeleted && setSelected(p)}
                className={`transition-colors group ${p.isDeleted ? "opacity-60 bg-red-50/30" : "cursor-pointer hover:bg-blue-50/40"}`}
              >
                {/* Utente */}
                <TableCell className="pl-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">
                      {p.client.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                        {p.client.name}
                      </p>
                      {p.paidAt && (
                        <p className="text-xs text-gray-400">
                          Pago em {formatDate(p.paidAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Serviço */}
                <TableCell className="py-3">
                  {p.appointment ? (
                    <div>
                      <p className="text-sm text-gray-700 font-medium">
                        {p.appointment.service.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Intl.DateTimeFormat("pt-PT", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                        }).format(new Date(p.appointment.startDateTime))}
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5">
                      Avulso
                    </span>
                  )}
                </TableCell>

                {/* Valor */}
                <TableCell className="py-3">
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(Number(p.amount))}
                  </span>
                </TableCell>

                {/* Vencimento */}
                <TableCell className="py-3">
                  {p.dueDate ? (
                    <div className="flex items-center gap-1.5">
                      {isOverdue && <Clock className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                      <span className={`text-sm ${isOverdue ? "text-red-600 font-semibold" : "text-gray-500"}`}>
                        {formatDate(p.dueDate)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </TableCell>

                {/* Estado */}
                <TableCell className="py-3">
                  <PaymentStatusBadge status={p.status} />
                </TableCell>

                <TableCell className="py-3">
                  <span className="text-sm text-gray-500">{formatDate(p.updatedAt)}</span>
                </TableCell>

                {/* Fatura */}
                <TableCell className="py-3">
                  <div className="flex items-center gap-1.5">
                    <InvoiceStatusBadge status={p.invoiceStatus} />
                    {p.invoiceNumber && (
                      <span className="text-xs text-gray-400 font-mono hidden xl:inline">
                        {p.invoiceNumber}
                      </span>
                    )}
                    {p.invoiceExternalUrl && (
                      <a
                        href={p.invoiceExternalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-500 hover:text-blue-700"
                        title="Abrir fatura"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </TableCell>

                {/* Acções */}
                <TableCell className="py-3 pr-4 text-right">
                  <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
                    {p.isDeleted ? (
                      <RestoreButton onRestore={() => restorePagamentoAction(p.id)} />
                    ) : (
                      <>
                        <MarkPaidButton id={p.id} status={p.status} />
                        <MarkPendingButton id={p.id} status={p.status} />
                        <Link href={`/pagamentos/${p.id}/editar`} onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Editar">
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <DeleteButton id={p.id} />
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Sheet de detalhes */}
      <PagamentoDetailSheet
        pagamento={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
