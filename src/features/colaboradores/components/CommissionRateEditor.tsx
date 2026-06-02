"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateCommissionRateAction } from "@/features/colaboradores/actions";
import { Check, Pencil, X } from "lucide-react";

interface Props {
  colaboradorId: string;
  currentRate: number;
}

export function CommissionRateEditor({ colaboradorId, currentRate }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(currentRate ?? 0));
  const [display, setDisplay] = useState(currentRate ?? 0);
  const [isPending, startTransition] = useTransition();

  function handleEdit() {
    setValue(String(display));
    setEditing(true);
  }

  function handleCancel() {
    setValue(String(display));
    setEditing(false);
  }

  function handleSave() {
    const rate = parseFloat(value);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error("Taxa inválida. Insira um valor entre 0 e 100.");
      return;
    }
    startTransition(async () => {
      const result = await updateCommissionRateAction(colaboradorId, rate);
      if (result?.success === false) {
        toast.error(result.error ?? "Erro ao atualizar comissão");
      } else {
        setDisplay(rate);
        setEditing(false);
        toast.success("Taxa de comissão actualizada");
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-end gap-1.5">
        <span className="font-medium text-gray-700 tabular-nums">{display}%</span>
        <button
          type="button"
          onClick={handleEdit}
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          title="Editar taxa de comissão"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <input
        type="number"
        min={0}
        max={100}
        step={0.5}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isPending}
        className="w-16 border border-blue-400 rounded px-1.5 py-0.5 text-sm text-right
                   focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        autoFocus
      />
      <span className="text-gray-500 text-sm">%</span>
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors disabled:opacity-50"
        title="Guardar"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={handleCancel}
        disabled={isPending}
        className="p-1 rounded hover:bg-red-100 text-red-400 transition-colors disabled:opacity-50"
        title="Cancelar"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
