export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { TENANT_ID } from "@/constants";
import { isAdmin } from "@/features/auth/actions";
import { FinancialAnnualSummary } from "@/features/financeiro/components/FinancialAnnualSummary";
import { MonthYearSelector } from "@/features/financeiro/components/MonthYearSelector";
import { getFinancialAnnualSummary } from "@/features/financeiro/repository";

interface PageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function FinancialAnnualSummaryPage({ searchParams }: PageProps) {
  if (!(await isAdmin())) redirect("/dashboard");

  const params = await searchParams;
  const year = Number(params.year ?? new Date().getFullYear());
  const summary = await getFinancialAnnualSummary(TENANT_ID, year);

  return (
    <div>
      <Header
        title="Resumo Anual"
        description="Visão anual por categoria e por mês para controlo interno"
      />
      <div className="space-y-6 p-6">
        <div className="flex justify-start">
          <MonthYearSelector year={year} month={1} basePath="/financeiro/resumo-anual" showMonth={false} />
        </div>
        <FinancialAnnualSummary {...summary} />
      </div>
    </div>
  );
}
