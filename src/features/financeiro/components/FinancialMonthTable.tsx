"use client";

import { useMemo, useState, useTransition } from "react";
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
  };
}

export function FinancialMonthTable({ year, month, rows, summary }: FinancialMonthTableProps) {
  const [entries, setEntries] = useState(rows);
  const [manualRevenueAdjustment, setManualRevenueAdjustment] = useState(String(summary.manualRevenueAdjustment || ""));
  const [savingsAmount, setSavingsAmount] = useState(String(summary.savingsAmount || ""));
  const [notes, setNotes] = useState(summary.notes || "");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totals = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        acc.planned += Number(entry.plannedValue || 0);
        acc.actual += Number(entry.actualValue || 0);
        return acc;
      },
      { planned: 0, actual: 0 }
    );
  }, [entries]);

  function updateEntry(categoryId: string, field: "plannedValue" | "actualValue" | "notes", value: string) {
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
      setMessage(result.success ? "Operação concluída." : result.error ?? "Erro ao executar operação.");
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
      setMessage(result.success ? "Plano mensal guardado." : result.error ?? "Erro ao guardar.");
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
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Valor para poupança</span>
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
              <TableHead>Grupo</TableHead>
              <TableHead className="min-w-36">Valor previsto</TableHead>
              <TableHead className="min-w-36">Valor realizado</TableHead>
              <TableHead>Diferença</TableHead>
              <TableHead className="min-w-64">Observações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => {
              const difference = Number(entry.actualValue || 0) - Number(entry.plannedValue || 0);
              return (
                <TableRow key={entry.categoryId}>
                  <TableCell className="font-medium text-slate-900">{entry.categoryName}</TableCell>
                  <TableCell className="text-slate-500">{entry.group}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={entry.plannedValue || ""}
                      onChange={(event) => updateEntry(entry.categoryId, "plannedValue", event.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={entry.actualValue || ""}
                      onChange={(event) => updateEntry(entry.categoryId, "actualValue", event.target.value)}
                    />
                  </TableCell>
                  <TableCell className={difference >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-red-600"}>
                    {formatCurrency(difference)}
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
              <TableCell colSpan={2}>Totais lançados</TableCell>
              <TableCell>{formatCurrency(totals.planned)}</TableCell>
              <TableCell>{formatCurrency(totals.actual)}</TableCell>
              <TableCell>{formatCurrency(totals.actual - totals.planned)}</TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
