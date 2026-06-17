"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createFinancialCategoryAction, updateFinancialCategoryAction } from "../actions";
import {
  FINANCIAL_CALCULATION_LABELS,
  FINANCIAL_CALCULATION_TYPES,
  FINANCIAL_GROUPS,
} from "../schema";

interface Category {
  id: string;
  name: string;
  group: string;
  type: string;
  calculationType: string;
  defaultValue: number | string | null;
  order: number;
  isActive: boolean;
}

export function FinancialCategoryForm({ category }: { category?: Category }) {
  const router = useRouter();
  const isEditing = !!category;
  const action = isEditing
    ? updateFinancialCategoryAction.bind(null, category.id)
    : createFinancialCategoryAction;

  return (
    <form action={action as (formData: FormData) => void} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome *</Label>
          <Input id="name" name="name" required defaultValue={category?.name} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="group">Grupo *</Label>
          <Select id="group" name="group" required defaultValue={category?.group ?? "Despesas Fixas"}>
            {FINANCIAL_GROUPS.map((group) => (
              <option key={group} value={group}>{group}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="calculationType">Natureza financeira *</Label>
          <Select
            id="calculationType"
            name="calculationType"
            required
            defaultValue={category?.calculationType ?? "operational_expense"}
          >
            {FINANCIAL_CALCULATION_TYPES.map((type) => (
              <option key={type} value={type}>{FINANCIAL_CALCULATION_LABELS[type]}</option>
            ))}
          </Select>
          <p className="text-xs text-slate-400">
            A natureza define como esta categoria entra nos cálculos do mês.
          </p>
          <input type="hidden" name="type" value={category?.type ?? "expense"} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="defaultValue">Valor previsto mensal padrão</Label>
          <Input
            id="defaultValue"
            name="defaultValue"
            type="number"
            step="0.01"
            min="0"
            defaultValue={category?.defaultValue?.toString() ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="order">Ordem de exibição</Label>
          <Input id="order" name="order" type="number" min="0" defaultValue={category?.order ?? 0} />
        </div>
        <label className="flex items-center gap-2 pt-7 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={category?.isActive ?? true}
            className="h-4 w-4 rounded border-slate-300 text-blue-600"
          />
          Categoria ativa
        </label>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit">{isEditing ? "Guardar alterações" : "Criar categoria"}</Button>
        <Button type="button" variant="outline" onClick={() => router.push("/financeiro/categorias")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
