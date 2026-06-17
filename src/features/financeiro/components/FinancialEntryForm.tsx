"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createFinancialEntryAction } from "../actions";

interface Category {
  id: string;
  name: string;
  group: string;
}

export function FinancialEntryForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={createFinancialEntryAction as (formData: FormData) => void} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="date">Data *</Label>
          <Input id="date" name="date" type="date" defaultValue={today} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="categoryId">Categoria *</Label>
          <Select id="categoryId" name="categoryId" required>
            <option value="">Selecionar categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.group} - {category.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="value">Valor *</Label>
          <Input id="value" name="value" type="number" step="0.01" min="0.01" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Descrição</Label>
          <Input id="description" name="description" />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea id="notes" name="notes" rows={4} />
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="submit">Guardar lançamento</Button>
        <Button type="button" variant="outline" onClick={() => router.push("/financeiro")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
