"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const FILTERS = [
  { value: "", label: "Todos" },
  { value: "scheduled", label: "Agendados" },
  { value: "completed", label: "Concluídos" },
  { value: "cancelled", label: "Cancelados" },
  { value: "no_show", label: "Não compareceu" },
];

interface Props {
  current?: string;
}

export function AgendamentoFilters({ current = "" }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => (
        <Link
          key={f.value}
          href={f.value ? `/agendamentos?status=${f.value}` : "/agendamentos"}
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
