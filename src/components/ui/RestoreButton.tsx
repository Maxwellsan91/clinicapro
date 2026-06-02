"use client";

import { useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onRestore: () => Promise<{ success: boolean; error?: string }>;
  label?: string;
}

export function RestoreButton({ onRestore, label = "Restaurar" }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          const result = await onRestore();
          if (result.success) {
            toast.success("Registo restaurado com sucesso.");
          } else {
            toast.error(result.error ?? "Erro ao restaurar.");
          }
        })
      }
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
    >
      <RotateCcw className="w-3.5 h-3.5" />
      {isPending ? "A restaurar…" : label}
    </button>
  );
}

