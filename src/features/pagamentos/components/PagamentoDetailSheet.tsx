"use client";

import { useTransition } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PaymentStatusBadge, InvoiceStatusBadge } from "./PaymentStatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  markAsPaidAction,
  markAsPendingAction,
  deletePagamentoAction,
} from "../actions";
import {
  User,
  Calendar,
  CreditCard,
  FileText,
  Clock,
  CheckCircle,
  RotateCcw,
  Edit,
  Trash2,
  ExternalLink,
  StickyNote,
  Hash,
  Link2,
  Euro,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import type { Payment, Client, Appointment, Service } from "@prisma/client";

export type PagamentoDetail = Payment & {
  client: Pick<Client, "id" | "name" | "email" | "phone">;
  appointment:
    | (Pick<Appointment, "id" | "startDateTime" | "endDateTime"> & {
        service: Pick<Service, "id" | "name" | "duration" | "price">;
      })
    | null;
};

interface Props {
  pagamento: PagamentoDetail | null;
  open: boolean;
  onClose: () => void;
}

function Row({ icon: Icon, label, value, className = "" }: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
        <div className={`text-sm text-gray-900 ${className}`}>{value}</div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <div className="bg-gray-50/60 rounded-xl px-3 divide-y divide-gray-50">
        {children}
      </div>
    </div>
  );
}

export function PagamentoDetailSheet({ pagamento, open, onClose }: Props) {
  const [isPendingPay, startPay] = useTransition();
  const [isPendingRevert, startRevert] = useTransition();
  const [isPendingDelete, startDelete] = useTransition();

  if (!pagamento) return null;

  const isOverdue =
    pagamento.dueDate &&
    new Date(pagamento.dueDate) < new Date() &&
    pagamento.status !== "paid";

  const fmt = (d: Date | string) =>
    new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(d));

  return (
    <Sheet open={open} onClose={onClose} width="w-full max-w-lg">

      {/* Cabeçalho visual */}
      <div className="px-6 pt-6 pb-5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
              Pagamento
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(Number(pagamento.amount))}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <PaymentStatusBadge status={pagamento.status} />
              <InvoiceStatusBadge status={pagamento.invoiceStatus} />
              {isOverdue && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                  <Clock className="w-3 h-3" />
                  Vencido
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Acções rápidas */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          {pagamento.status !== "paid" && (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white gap-1.5 rounded-lg"
              disabled={isPendingPay}
              onClick={() => startPay(async () => { await markAsPaidAction(pagamento.id); onClose(); })}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {isPendingPay ? "A processar..." : "Marcar como pago"}
            </Button>
          )}
          {pagamento.status === "paid" && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 rounded-lg text-yellow-700 border-yellow-200 hover:bg-yellow-50"
              disabled={isPendingRevert}
              onClick={() => startRevert(async () => { await markAsPendingAction(pagamento.id); onClose(); })}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {isPendingRevert ? "A processar..." : "Repor pendente"}
            </Button>
          )}
          <Link href={`/pagamentos/${pagamento.id}/editar`}>
            <Button size="sm" variant="outline" className="gap-1.5 rounded-lg">
              <Edit className="w-3.5 h-3.5" />
              Editar
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 rounded-lg text-red-600 border-red-200 hover:bg-red-50 ml-auto"
            disabled={isPendingDelete}
            onClick={() => {
              if (!confirm("Tem a certeza que pretende eliminar este pagamento?")) return;
              startDelete(async () => { await deletePagamentoAction(pagamento.id); onClose(); });
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isPendingDelete ? "A eliminar..." : "Eliminar"}
          </Button>
        </div>
      </div>

      {/* Detalhes */}
      <div className="overflow-y-auto pb-8">

        {/* Utente */}
        <Section title="Utente">
          <Row icon={User} label="Nome" value={
            <Link href={`/clientes/${pagamento.client.id}`} className="text-blue-600 hover:underline font-medium">
              {pagamento.client.name}
            </Link>
          } />
          {pagamento.client.email && (
            <Row icon={User} label="E-mail" value={pagamento.client.email} className="text-gray-600" />
          )}
          {pagamento.client.phone && (
            <Row icon={User} label="Telefone" value={pagamento.client.phone} className="text-gray-600" />
          )}
        </Section>

        {/* Financeiro */}
        <Section title="Financeiro">
          <Row icon={Euro} label="Valor" value={
            <span className="text-base font-bold text-gray-900">
              {formatCurrency(Number(pagamento.amount))}
            </span>
          } />
          <Row icon={CreditCard} label="Método" value={
            pagamento.paymentMethod
              ? <span className="font-medium">{pagamento.paymentMethod}</span>
              : <span className="text-gray-400 italic">Não especificado</span>
          } />
          {pagamento.paidAt && (
            <Row icon={CheckCircle} label="Pago em" value={
              <span className="text-green-700 font-medium">{fmt(pagamento.paidAt)}</span>
            } />
          )}
          {pagamento.dueDate && (
            <Row icon={Clock} label="Vencimento" value={
              <span className={isOverdue ? "text-red-600 font-semibold" : "text-gray-700"}>
                {formatDate(pagamento.dueDate)}
                {isOverdue && " · Vencido"}
              </span>
            } />
          )}
        </Section>

        {/* Sessão associada */}
        {pagamento.appointment && (
          <Section title="Sessão Associada">
            <Row icon={Briefcase} label="Serviço" value={
              <span className="font-medium">{pagamento.appointment.service.name}</span>
            } />
            <Row icon={Calendar} label="Início" value={fmt(pagamento.appointment.startDateTime)} />
            <Row icon={Calendar} label="Fim" value={fmt(pagamento.appointment.endDateTime)} />
          </Section>
        )}

        {/* Fatura */}
        <Section title="Fatura">
          <Row icon={FileText} label="Estado" value={
            <InvoiceStatusBadge status={pagamento.invoiceStatus} />
          } />
          {pagamento.invoiceNumber && (
            <Row icon={Hash} label="Número" value={
              <span className="font-mono text-sm font-medium">{pagamento.invoiceNumber}</span>
            } />
          )}
          {pagamento.invoiceExternalUrl && (
            <Row icon={Link2} label="Link" value={
              <a
                href={pagamento.invoiceExternalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-600 hover:underline"
              >
                Abrir fatura <ExternalLink className="w-3 h-3" />
              </a>
            } />
          )}
        </Section>

        {/* Observações */}
        {pagamento.notes && (
          <Section title="Observações">
            <div className="py-3">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 shrink-0">
                  <StickyNote className="w-4 h-4 text-gray-500" />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed pt-1">
                  {pagamento.notes}
                </p>
              </div>
            </div>
          </Section>
        )}

        {/* Metadados */}
        <Section title="Registo">
          <Row icon={Calendar} label="Criado em" value={fmt(pagamento.createdAt)} className="text-gray-500" />
          <Row icon={Calendar} label="Actualizado em" value={fmt(pagamento.updatedAt)} className="text-gray-500" />
          <Row icon={Hash} label="ID" value={
            <span className="font-mono text-xs text-gray-400 break-all">{pagamento.id}</span>
          } />
        </Section>

      </div>
    </Sheet>
  );
}

