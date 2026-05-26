"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { createPagamentoAction, updatePagamentoAction } from "../actions";
import {
  PAYMENT_STATUS_VALUES,
  INVOICE_STATUS_VALUES,
  PAYMENT_METHOD_VALUES,
} from "../schema";
import type { Client, Payment, Appointment, Service } from "@prisma/client";

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending:   "Pendente",
  paid:      "Pago",
  partial:   "Parcial",
  cancelled: "Cancelado",
};

const INVOICE_STATUS_LABELS: Record<string, string> = {
  not_issued: "Por emitir",
  issued:     "Emitida",
};

type AppointmentOption = Appointment & {
  service: Pick<Service, "id" | "name">;
};

type PagamentoWithRelations = Payment & {
  client: Pick<Client, "id" | "name">;
  appointment: (Pick<Appointment, "id" | "startDateTime"> & {
    service: Pick<Service, "id" | "name">;
  }) | null;
};

interface PagamentoFormProps {
  pagamento?: PagamentoWithRelations;
  clientes: Pick<Client, "id" | "name">[];
  agendamentos: AppointmentOption[];
}

function formatDatetimeLocal(date: Date | string): string {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDateLocal(date: Date | string): string {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function PagamentoForm({
  pagamento,
  clientes,
  agendamentos,
}: PagamentoFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!pagamento;
  const [status, setStatus] = useState(pagamento?.status ?? "pending");

  const action = isEditing
    ? updatePagamentoAction.bind(null, pagamento.id)
    : createPagamentoAction;

  return (
    <form action={action as (formData: FormData) => void} className="space-y-6">
      {/* Secção principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Utente */}
        <div className="space-y-1.5">
          <Label htmlFor="clientId">Utente *</Label>
          <Select
            id="clientId"
            name="clientId"
            defaultValue={pagamento?.clientId ?? ""}
            required
          >
            <option value="">Selecione um utente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Valor */}
        <div className="space-y-1.5">
          <Label htmlFor="amount">Valor (€) *</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={pagamento?.amount?.toString() ?? ""}
            required
            placeholder="0,00"
          />
        </div>

        {/* Método de pagamento */}
        <div className="space-y-1.5">
          <Label htmlFor="paymentMethod">Método de Pagamento</Label>
          <Select
            id="paymentMethod"
            name="paymentMethod"
            defaultValue={pagamento?.paymentMethod ?? ""}
          >
            <option value="">Selecione um método</option>
            {PAYMENT_METHOD_VALUES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </div>

        {/* Estado */}
        <div className="space-y-1.5">
          <Label htmlFor="status">Estado</Label>
          <Select
            id="status"
            name="status"
            defaultValue={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {PAYMENT_STATUS_VALUES.map((s) => (
              <option key={s} value={s}>
                {PAYMENT_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>

        {/* Data de pagamento */}
        <div className="space-y-1.5">
          <Label htmlFor="paidAt">
            Data de Pagamento
            {status === "paid" && (
              <span className="text-blue-500 ml-1 text-xs">(obrigatório se pago)</span>
            )}
          </Label>
          <Input
            id="paidAt"
            name="paidAt"
            type="datetime-local"
            defaultValue={
              pagamento?.paidAt
                ? formatDatetimeLocal(pagamento.paidAt)
                : ""
            }
          />
        </div>

        {/* Data de vencimento */}
        <div className="space-y-1.5">
          <Label htmlFor="dueDate">Data de Vencimento</Label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={
              pagamento?.dueDate ? formatDateLocal(pagamento.dueDate) : ""
            }
          />
        </div>

        {/* Agendamento associado */}
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="appointmentId">Consulta / Sessão Associada</Label>
          <Select
            id="appointmentId"
            name="appointmentId"
            defaultValue={pagamento?.appointmentId ?? ""}
          >
            <option value="">Nenhuma (pagamento avulso)</option>
            {agendamentos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.service.name} —{" "}
                {new Intl.DateTimeFormat("pt-PT", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(a.startDateTime))}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Secção Fatura */}
      <div className="rounded-lg border border-gray-200 p-4 space-y-4">
        <p className="text-sm font-semibold text-gray-700">
          📄 Dados da Fatura
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="invoiceStatus">Estado da Fatura</Label>
            <Select
              id="invoiceStatus"
              name="invoiceStatus"
              defaultValue={pagamento?.invoiceStatus ?? "not_issued"}
            >
              {INVOICE_STATUS_VALUES.map((s) => (
                <option key={s} value={s}>
                  {INVOICE_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invoiceNumber">Número da Fatura</Label>
            <Input
              id="invoiceNumber"
              name="invoiceNumber"
              defaultValue={pagamento?.invoiceNumber ?? ""}
              placeholder="FT 2026/001"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invoiceExternalUrl">Link da Fatura</Label>
            <Input
              id="invoiceExternalUrl"
              name="invoiceExternalUrl"
              type="url"
              defaultValue={pagamento?.invoiceExternalUrl ?? ""}
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      {/* Observações */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={pagamento?.notes ?? ""}
          placeholder="Notas internas sobre este pagamento..."
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "A guardar..."
            : isEditing
            ? "Guardar Alterações"
            : "Criar Pagamento"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/pagamentos")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

