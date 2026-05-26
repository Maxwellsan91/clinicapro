"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const FILTERS = [
  { value: "", label: "Todos" },
  { value: "scheduled", label: "Agendados" },
  { value: "completed", label: "Concluídos" },
  { value: "cancelled", label: "Cancelados" },
  { value: "no_show", label: "Não compareceu" },
];

export function AgendamentoFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("status") ?? "";

  function handleFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    router.push(`/agendamentos?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => handleFilter(f.value)}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-full border transition-colors",
            current === f.value
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

