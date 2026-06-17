export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TENANT_ID } from "@/constants";
import { isAdmin } from "@/features/auth/actions";
import { FinancialCategoryForm } from "@/features/financeiro/components/FinancialCategoryForm";
import { FinancialCategoryList } from "@/features/financeiro/components/FinancialCategoryList";
import { findFinancialCategories, findFinancialCategoryById } from "@/features/financeiro/repository";
import { serializeDecimal } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ id?: string; deleted?: string }>;
}

export default async function FinancialCategoriesPage({ searchParams }: PageProps) {
  if (!(await isAdmin())) redirect("/dashboard");

  const params = await searchParams;
  const [rawCategories, rawCategory] = await Promise.all([
    findFinancialCategories(TENANT_ID, params.deleted === "1"),
    params.id ? findFinancialCategoryById(params.id, TENANT_ID) : Promise.resolve(null),
  ]);
  const categories = serializeDecimal(rawCategories).map((item) => ({
    id: item.id,
    name: item.name,
    group: item.group,
    type: item.type,
    defaultValue: item.defaultValue === null ? null : Number(item.defaultValue),
    order: item.order,
    isActive: item.isActive,
    isDeleted: item.isDeleted,
  }));
  const serializedCategory = rawCategory ? serializeDecimal(rawCategory) : undefined;
  const category = serializedCategory
    ? {
        id: serializedCategory.id,
        name: serializedCategory.name,
        group: serializedCategory.group,
        type: serializedCategory.type,
        defaultValue: serializedCategory.defaultValue === null ? null : Number(serializedCategory.defaultValue),
        order: serializedCategory.order,
        isActive: serializedCategory.isActive,
      }
    : undefined;

  return (
    <div>
      <Header
        title="Categorias Financeiras"
        description="Estrutura interna para custos, receitas, poupanças e investimentos"
      />
      <div className="grid gap-6 p-6 xl:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{category ? "Editar categoria" : "Nova categoria"}</CardTitle>
          </CardHeader>
          <CardContent>
            <FinancialCategoryForm category={category} />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Categorias</CardTitle>
            <a
              href={params.deleted === "1" ? "/financeiro/categorias" : "/financeiro/categorias?deleted=1"}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {params.deleted === "1" ? "Ver ativas" : "Ver eliminadas"}
            </a>
          </CardHeader>
          <CardContent className="p-0">
            <FinancialCategoryList categories={categories} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
