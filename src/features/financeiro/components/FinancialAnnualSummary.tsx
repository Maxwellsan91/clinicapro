"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Download } from "lucide-react";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

interface AnnualRow {
  categoryId: string;
  categoryName: string;
  group: string;
  months: number[];
  total: number;
}

interface FinancialAnnualSummaryProps {
  year: number;
  rows: AnnualRow[];
  monthTotals: number[];
  annualTotal: number;
}

export function FinancialAnnualSummary({ year, rows, monthTotals, annualTotal }: FinancialAnnualSummaryProps) {
  function exportExcel() {
    const header = ["Categoria", "Grupo", ...MONTHS, "Total"];
    const body = rows.map((row) => [
      row.categoryName,
      row.group,
      ...row.months.map((value) => value.toFixed(2)),
      row.total.toFixed(2),
    ]);
    body.push(["Total mensal", "", ...monthTotals.map((value) => value.toFixed(2)), annualTotal.toFixed(2)]);

    const table = [header, ...body]
      .map((line) => `<tr>${line.map((cell) => `<td>${String(cell).replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</td>`).join("")}</tr>`)
      .join("");
    const html = `<html><head><meta charset="utf-8" /></head><body><table>${table}</table></body></html>`;
    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `financeiro-interno-${year}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" onClick={exportExcel}>
          <Download className="h-4 w-4" />
          Exportar Excel
        </Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="min-w-56">Categoria</TableHead>
              <TableHead className="min-w-40">Grupo</TableHead>
              {MONTHS.map((month) => (
                <TableHead key={month} className="text-right">{month}</TableHead>
              ))}
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.categoryId}>
                <TableCell className="font-medium text-slate-900">{row.categoryName}</TableCell>
                <TableCell className="text-slate-500">{row.group}</TableCell>
                {row.months.map((value, index) => (
                  <TableCell key={index} className="text-right text-slate-600">
                    {value ? formatCurrency(value) : "-"}
                  </TableCell>
                ))}
                <TableCell className="text-right font-semibold">{formatCurrency(row.total)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-slate-50 font-semibold">
              <TableCell>Total mensal</TableCell>
              <TableCell />
              {monthTotals.map((value, index) => (
                <TableCell key={index} className="text-right">{formatCurrency(value)}</TableCell>
              ))}
              <TableCell className="text-right">{formatCurrency(annualTotal)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
