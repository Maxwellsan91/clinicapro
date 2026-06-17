"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RestoreButton } from "@/components/ui/RestoreButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { deleteFinancialCategoryAction, restoreFinancialCategoryAction } from "../actions";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  group: string;
  type: string;
  defaultValue: number | null;
  order: number;
  isActive: boolean;
  isDeleted: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  expense: "Despesa",
  tax: "Imposto",
  insurance: "Seguro",
  investment: "Investimento",
  savings: "Poupança",
  revenue: "Receita",
};

function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={isPending}
      className="text-red-500 hover:bg-red-50 hover:text-red-700"
      onClick={() => {
        if (!confirm("Tem a certeza que pretende eliminar esta categoria?")) return;
        startTransition(async () => { await deleteFinancialCategoryAction(id); });
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

export function FinancialCategoryList({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500">
        <p className="font-medium">Nenhuma categoria financeira encontrada</p>
        <p className="mt-1 text-sm">Crie categorias para gerar o plano mensal.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-slate-50">
          <TableHead>Categoria</TableHead>
          <TableHead>Grupo</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Valor padrão</TableHead>
          <TableHead>Ordem</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id} className={category.isDeleted ? "bg-red-50/30 opacity-60" : ""}>
            <TableCell className="font-medium text-slate-900">{category.name}</TableCell>
            <TableCell className="text-slate-500">{category.group}</TableCell>
            <TableCell className="text-slate-500">{TYPE_LABELS[category.type] ?? category.type}</TableCell>
            <TableCell>{category.defaultValue !== null ? formatCurrency(Number(category.defaultValue)) : "-"}</TableCell>
            <TableCell>{category.order}</TableCell>
            <TableCell>
              {category.isDeleted ? (
                <Badge variant="destructive">Eliminada</Badge>
              ) : (
                <Badge variant={category.isActive ? "success" : "secondary"}>
                  {category.isActive ? "Ativa" : "Inativa"}
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                {category.isDeleted ? (
                  <RestoreButton onRestore={() => restoreFinancialCategoryAction(category.id)} />
                ) : (
                  <>
                    <Link href={`/financeiro/categorias?id=${category.id}`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DeleteButton id={category.id} />
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
