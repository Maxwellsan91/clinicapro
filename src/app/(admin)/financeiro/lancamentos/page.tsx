export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TENANT_ID } from "@/constants";
import { isAdmin } from "@/features/auth/actions";
import { FinancialEntryForm } from "@/features/financeiro/components/FinancialEntryForm";
import { findActiveFinancialCategories } from "@/features/financeiro/repository";

export default async function FinancialEntriesPage() {
  if (!(await isAdmin())) redirect("/dashboard");

  const categories = await findActiveFinancialCategories(TENANT_ID);

  return (
    <div>
      <Header
        title="Lançamentos Financeiros"
        description="Registo rápido de despesas avulsas no mês correspondente"
      />
      <div className="p-6">
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Novo lançamento</CardTitle>
          </CardHeader>
          <CardContent>
            <FinancialEntryForm categories={categories} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
