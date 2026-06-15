"use client";

import { useState, useTransition } from "react";
import { X, Plus, Banknote, Gift } from "lucide-react";
import { toast } from "sonner";
import { createCommissionPaymentAction } from "../commissionPaymentActions";
import { cn } from "@/lib/utils";

interface Props {
  colaboradorId: string;
  saldoDevido: number;
}

const TYPE_OPTIONS = [
  { value: "payment", label: "Pagamento total/parcial", icon: Banknote, color: "border-green-400 bg-green-50 text-green-800" },
  { value: "advance", label: "Adiantamento",            icon: Gift,     color: "border-blue-400 bg-blue-50 text-blue-800" },
] as const;

const today = () => new Date().toISOString().slice(0, 10);

export function RegisterCommissionPaymentModal({ colaboradorId, saldoDevido }: Props) {
  const [open, setOpen]         = useState(false);
  const [type, setType]         = useState<"payment" | "advance">("payment");
  const [amount, setAmount]     = useState("");
  const [notes, setNotes]       = useState("");
  const [paidAt, setPaidAt]     = useState(today());
  const [isPending, startTransition] = useTransition();

  function reset() {
    setType("payment"); setAmount(""); setNotes(""); setPaidAt(today());
  }

  function handleClose() { reset(); setOpen(false); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("colaboradorId", colaboradorId);
    fd.set("amount",        amount);
    fd.set("type",          type);
    fd.set("notes",         notes);
    fd.set("paidAt",        paidAt);

    startTransition(async () => {
      const res = await createCommissionPaymentAction(fd);
      if (res.success) {
        toast.success(type === "advance" ? "Adiantamento registado!" : "Pagamento registado!");
        handleClose();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Registar pagamento
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Registar pagamento ao colaborador</h2>
              <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* Saldo devedor info */}
              {saldoDevido > 0 && (
                <div className="rounded-xl bg-purple-50 border border-purple-200 px-4 py-3 text-sm text-purple-800">
                  <span className="font-medium">Saldo em dívida (total):</span>{" "}
                  <span className="font-bold">
                    {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(saldoDevido)}
                  </span>
                </div>
              )}

              {/* Tipo */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tipo de pagamento</label>
                <div className="grid grid-cols-2 gap-2">
                  {TYPE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setType(opt.value)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-sm font-medium transition-all",
                          type === opt.value ? opt.color : "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Valor */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Valor (€) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Data */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Data do pagamento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={paidAt}
                  onChange={(e) => setPaidAt(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Notas */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Notas</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Observações opcionais…"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || !amount || !paidAt}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isPending ? "A registar…" : "Confirmar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

