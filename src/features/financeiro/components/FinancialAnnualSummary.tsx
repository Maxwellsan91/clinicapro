"use client";

import { Fragment, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Download } from "lucide-react";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

interface AnnualRow {
  categoryId: string;
  categoryName: string;
  group: string;
  calculationType: string;
  months: number[];
  total: number;
}

interface FinancialAnnualSummaryProps {
  year: number;
  rows: AnnualRow[];
  monthTotals: number[];
  annualTotal: number;
  footer: {
    totalRevenue: number[];
    totalOperationalCosts: number[];
    operationalResult: number[];
    totalSavingsReserve: number[];
    totalInvestments: number[];
    finalBalance: number[];
    annual: {
      totalRevenue: number;
      totalOperationalCosts: number;
      operationalResult: number;
      totalSavingsReserve: number;
      totalInvestments: number;
      finalBalance: number;
    };
  };
}

const SECTIONS = [
  { key: "income", label: "Receitas" },
  { key: "personnel_cost", label: "Custos com pessoal" },
  { key: "operational_expense", label: "Despesas operacionais" },
  { key: "tax", label: "Impostos e contribuições" },
  { key: "insurance", label: "Seguros" },
  { key: "investment", label: "Investimentos" },
  { key: "saving_reserve", label: "Reservas e poupança" },
  { key: "internal_transfer", label: "Transferências internas" },
];

export function FinancialAnnualSummary({ year, rows, footer }: FinancialAnnualSummaryProps) {
  const groupedRows = useMemo(
    () =>
      SECTIONS.map((section) => ({
        ...section,
        rows: rows.filter((row) => row.calculationType === section.key),
      })).filter((section) => section.rows.length > 0),
    [rows]
  );

  function exportExcel() {
    const header = ["Secção", "Categoria", "Grupo", ...MONTHS, "Total"];
    const body = groupedRows.flatMap((section) =>
      section.rows.map((row) => [
        section.label,
        row.categoryName,
        row.group,
        ...row.months.map((value) => value.toFixed(2)),
        row.total.toFixed(2),
      ])
    );
    body.push(
      ["", "Total receitas", "", ...footer.totalRevenue.map((value) => value.toFixed(2)), footer.annual.totalRevenue.toFixed(2)],
      ["", "Total custos operacionais", "", ...footer.totalOperationalCosts.map((value) => value.toFixed(2)), footer.annual.totalOperationalCosts.toFixed(2)],
      ["", "Resultado operacional", "", ...footer.operationalResult.map((value) => value.toFixed(2)), footer.annual.operationalResult.toFixed(2)],
      ["", "Total poupança/reserva", "", ...footer.totalSavingsReserve.map((value) => value.toFixed(2)), footer.annual.totalSavingsReserve.toFixed(2)],
      ["", "Total investimentos", "", ...footer.totalInvestments.map((value) => value.toFixed(2)), footer.annual.totalInvestments.toFixed(2)],
      ["", "Saldo final", "", ...footer.finalBalance.map((value) => value.toFixed(2)), footer.annual.finalBalance.toFixed(2)]
    );

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
              {MONTHS.map((month) => (
                <TableHead key={month} className="text-right">{month}</TableHead>
              ))}
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedRows.map((section) => (
              <Fragment key={section.key}>
                <TableRow className="bg-slate-100/80 hover:bg-slate-100/80">
                  <TableCell colSpan={14} className="py-3 text-xs font-bold uppercase tracking-wider text-slate-600">
                    {section.label}
                  </TableCell>
                </TableRow>
                {section.rows.map((row) => (
                  <TableRow key={row.categoryId}>
                    <TableCell>
                      <p className="font-medium text-slate-900">{row.categoryName}</p>
                      <p className="text-xs text-slate-400">{row.group}</p>
                    </TableCell>
                    {row.months.map((value, index) => (
                      <TableCell key={index} className="text-right text-slate-600">
                        {value ? formatCurrency(value) : "-"}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-semibold">{formatCurrency(row.total)}</TableCell>
                  </TableRow>
                ))}
              </Fragment>
            ))}
            {[
              ["Total receitas", footer.totalRevenue, footer.annual.totalRevenue],
              ["Total custos operacionais", footer.totalOperationalCosts, footer.annual.totalOperationalCosts],
              ["Resultado operacional", footer.operationalResult, footer.annual.operationalResult],
              ["Total poupança/reserva", footer.totalSavingsReserve, footer.annual.totalSavingsReserve],
              ["Total investimentos", footer.totalInvestments, footer.annual.totalInvestments],
              ["Saldo final", footer.finalBalance, footer.annual.finalBalance],
            ].map(([label, values, total]) => (
              <TableRow key={label as string} className="bg-slate-50 font-semibold">
                <TableCell>{label as string}</TableCell>
                {(values as number[]).map((value, index) => (
                  <TableCell key={index} className="text-right">{value ? formatCurrency(value) : "-"}</TableCell>
                ))}
                <TableCell className="text-right">{formatCurrency(total as number)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
