import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FinancialMonthTable } from "./FinancialMonthTable";
import { FinancialSummaryCards } from "./FinancialSummaryCards";
import { MonthYearSelector } from "./MonthYearSelector";
import { Plus, Settings, Table2 } from "lucide-react";

interface FinancialDashboardProps {
  data: {
    year: number;
    month: number;
    rows: Array<{
      categoryId: string;
      categoryName: string;
      group: string;
      type: string;
      calculationType: string;
      plannedValue: number;
      actualValue: number;
      notes: string;
    }>;
    summary: {
      manualRevenueAdjustment: number;
      savingsAmount: number;
      notes: string;
      paidRevenue: number;
      categoryIncome: number;
      realizedRevenue: number;
      operationalCosts: number;
      operationalResult: number;
      savingsReserve: number;
      investments: number;
      availableBalance: number;
      previousBalance: number;
      nextMonthBalance: number;
      carriedBalance: number;
    };
  };
}

export function FinancialDashboard({ data }: FinancialDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <MonthYearSelector year={data.year} month={data.month} />
        <div className="flex flex-wrap gap-2">
          <Link href="/financeiro/lancamentos">
            <Button variant="outline">
              <Plus className="h-4 w-4" />
              Lançamento
            </Button>
          </Link>
          <Link href="/financeiro/categorias">
            <Button variant="outline">
              <Settings className="h-4 w-4" />
              Categorias
            </Button>
          </Link>
          <Link href={`/financeiro/resumo-anual?year=${data.year}`}>
            <Button variant="outline">
              <Table2 className="h-4 w-4" />
              Resumo anual
            </Button>
          </Link>
        </div>
      </div>

      <FinancialSummaryCards summary={data.summary} />

      <FinancialMonthTable
        year={data.year}
        month={data.month}
        rows={data.rows}
        summary={data.summary}
      />
    </div>
  );
}
