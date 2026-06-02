"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const FILTERS = [
  { value: "",          label: "Todos" },
  { value: "pending",   label: "Pendentes" },
  { value: "paid",      label: "Pagos" },
  { value: "partial",   label: "Parciais" },
  { value: "cancelled", label: "Cancelados" },
];

interface Props {
  current?: string;
}

export function PagamentoFilters({ current = "" }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => (
        <Link
          key={f.value}
          href={f.value ? `/pagamentos?status=${f.value}` : "/pagamentos"}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-full border transition-colors",
            current === f.value
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"
          )}
        >
          {f.label}
        </Link>
      ))}
    </div>
  );
}
