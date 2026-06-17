export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { TENANT_ID } from "@/constants";
import { isAdmin } from "@/features/auth/actions";
import { FinancialDashboard } from "@/features/financeiro/components/FinancialDashboard";
import { getFinancialMonth } from "@/features/financeiro/repository";

interface PageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function FinanceiroPage({ searchParams }: PageProps) {
  if (!(await isAdmin())) redirect("/dashboard");

  const params = await searchParams;
  const now = new Date();
  const year = Number(params.year ?? now.getFullYear());
  const month = Number(params.month ?? now.getMonth() + 1);
  const data = await getFinancialMonth(TENANT_ID, year, month);

  return (
    <div>
      <Header
        title="Financeiro Interno"
        description="Controlo interno de custos, receitas, poupança e resultado mensal"
      />
      <div className="p-6">
        <FinancialDashboard data={data} />
      </div>
    </div>
  );
}
