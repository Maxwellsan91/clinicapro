"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import {
  copyPreviousFinancialMonthAction,
  generateFinancialMonthAction,
  saveFinancialMonthAction,
} from "../actions";
import { Copy, RefreshCw, Save } from "lucide-react";

interface FinancialRow {
  categoryId: string;
  categoryName: string;
  group: string;
  type: string;
  calculationType: string;
  plannedValue: number;
  actualValue: number;
  notes: string;
}

interface FinancialMonthTableProps {
  year: number;
  month: number;
  rows: FinancialRow[];
  summary: {
    manualRevenueAdjustment: number;
    savingsAmount: number;
    notes: string;
    realizedRevenue: number;
    operationalCosts: number;
    operationalResult: number;
  };
}

export function FinancialMonthTable({ year, month, rows, summary }: FinancialMonthTableProps) {
  const [entries, setEntries] = useState(rows);
  const [manualRevenueAdjustment, setManualRevenueAdjustment] = useState(String(summary.manualRevenueAdjustment || ""));
  const [savingsAmount, setSavingsAmount] = useState(String(summary.savingsAmount || ""));
  const [notes, setNotes] = useState(summary.notes || "");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sections = useMemo(() => {
    const config = [
      { key: "income", label: "Receitas" },
      { key: "personnel_cost", label: "Custos com pessoal" },
      { key: "fixed_expense", label: "Despesas fixas" },
      { key: "variable_expense", label: "Despesas variáveis" },
      { key: "tax", label: "Impostos e contribuições" },
      { key: "insurance", label: "Seguros" },
      { key: "investment", label: "Investimentos" },
      { key: "saving_reserve", label: "Reservas e poupança" },
      { key: "internal_transfer", label: "Transferências internas" },
    ];

    function sectionKey(entry: FinancialRow) {
      if (entry.calculationType === "operational_expense") {
        return entry.group === "Despesas Fixas" ? "fixed_expense" : "variable_expense";
      }
      return entry.calculationType;
    }

    return config
      .map((section) => {
        const items = entries.filter((entry) => sectionKey(entry) === section.key);
        const total = items.reduce((acc, entry) => acc + Number(entry.actualValue || 0), 0);
        return { ...section, items, total };
      })
      .filter((section) => section.items.length > 0);
  }, [entries]);

  function updateEntry(categoryId: string, field: "actualValue" | "notes", value: string) {
    setEntries((current) =>
      current.map((entry) =>
        entry.categoryId === categoryId
          ? { ...entry, [field]: field === "notes" ? value : Number(value || 0) }
          : entry
      )
    );
  }

  function runMonthAction(action: (formData: FormData) => Promise<{ success: boolean; error?: string }>) {
    setMessage(null);
    const formData = new FormData();
    formData.set("year", String(year));
    formData.set("month", String(month));
    startTransition(async () => {
      const result = await action(formData);
      setMessage(result.success ? "Estrutura mensal actualizada." : result.error ?? "Erro ao executar operação.");
    });
  }

  function save() {
    setMessage(null);
    const formData = new FormData();
    formData.set("year", String(year));
    formData.set("month", String(month));
    formData.set("manualRevenueAdjustment", manualRevenueAdjustment);
    formData.set("savingsAmount", savingsAmount);
    formData.set("notes", notes);
    formData.set(
      "entries",
      JSON.stringify(
        entries.map((entry) => ({
          categoryId: entry.categoryId,
          plannedValue: entry.plannedValue,
          actualValue: entry.actualValue,
          notes: entry.notes,
        }))
      )
    );

    startTransition(async () => {
      const result = await saveFinancialMonthAction(formData);
      setMessage(result.success ? "Resumo mensal guardado." : result.error ?? "Erro ao guardar.");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ajuste manual de receitas</span>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={manualRevenueAdjustment}
              onChange={(event) => setManualRevenueAdjustment(event.target.value)}
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Reserva manual</span>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={savingsAmount}
              onChange={(event) => setSavingsAmount(event.target.value)}
            />
          </label>
          <label className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Notas do mês</span>
            <Input value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => runMonthAction(generateFinancialMonthAction)}
          >
            <RefreshCw className="h-4 w-4" />
            Gerar mês
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => runMonthAction(copyPreviousFinancialMonthAction)}
          >
            <Copy className="h-4 w-4" />
            Copiar anterior
          </Button>
          <Button type="button" disabled={isPending} onClick={save}>
            <Save className="h-4 w-4" />
            Guardar
          </Button>
        </div>
      </div>

      {message && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          {message}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Categoria</TableHead>
              <TableHead className="min-w-36">Realizado</TableHead>
              <TableHead className="min-w-64">Observações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections.map((section) => (
              <Fragment key={section.key}>
                <TableRow className="bg-slate-100/80 hover:bg-slate-100/80">
                  <TableCell colSpan={3} className="py-3 text-xs font-bold uppercase tracking-wider text-slate-600">
                    {section.label}
                  </TableCell>
                </TableRow>
                {section.items.map((entry) => {
                  return (
                    <TableRow key={entry.categoryId}>
                      <TableCell className="font-medium text-slate-900">{entry.categoryName}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={entry.actualValue || ""}
                          onChange={(event) => updateEntry(entry.categoryId, "actualValue", event.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Textarea
                          rows={2}
                          value={entry.notes}
                          onChange={(event) => updateEntry(entry.categoryId, "notes", event.target.value)}
                          className="min-h-16"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-slate-50 font-semibold">
                  <TableCell>Subtotal {section.label.toLowerCase()}</TableCell>
                  <TableCell>{formatCurrency(section.total)}</TableCell>
                  <TableCell />
                </TableRow>
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">Despesas do mês</p>
          <p className="mt-2 text-xl font-bold text-rose-900">{formatCurrency(summary.operationalCosts)}</p>
          <p className="mt-1 text-xs text-rose-700">Pessoal, despesas fixas, variáveis, impostos e seguros.</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Ganhos mensais</p>
          <p className="mt-2 text-xl font-bold text-emerald-900">{formatCurrency(summary.realizedRevenue)}</p>
          <p className="mt-1 text-xs text-emerald-700">Receitas realizadas no período.</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Diferença final</p>
          <p className={`mt-2 text-xl font-bold ${summary.operationalResult >= 0 ? "text-blue-700" : "text-red-700"}`}>
            {formatCurrency(summary.operationalResult)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Ganhos mensais menos despesas do mês.</p>
        </div>
      </div>
    </div>
  );
}
