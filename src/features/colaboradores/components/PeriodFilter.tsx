"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESETS = [
  { label: "Este mês",      key: "this_month" },
  { label: "Mês anterior",  key: "last_month" },
  { label: "Últimos 3 meses", key: "last_3" },
  { label: "Últimos 6 meses", key: "last_6" },
  { label: "Este ano",      key: "this_year" },
  { label: "Personalizado", key: "custom" },
] as const;

type PresetKey = (typeof PRESETS)[number]["key"];

interface Props {
  currentPreset: PresetKey;
  customFrom?: string;
  customTo?: string;
}

export function PeriodFilter({ currentPreset, customFrom, customTo }: Props) {
  const router    = useRouter();
  const pathname  = usePathname();
  const params    = useSearchParams();

  const [from, setFrom] = useState(customFrom ?? "");
  const [to,   setTo]   = useState(customTo   ?? "");

  function applyPreset(key: PresetKey) {
    const p = new URLSearchParams(params.toString());
    p.set("preset", key);
    p.delete("from");
    p.delete("to");
    router.push(`${pathname}?${p.toString()}`);
  }

  function applyCustom() {
    if (!from || !to) return;
    const p = new URLSearchParams(params.toString());
    p.set("preset", "custom");
    p.set("from",   from);
    p.set("to",     to);
    router.push(`${pathname}?${p.toString()}`);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      <p className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <CalendarRange className="w-3.5 h-3.5" />
        Filtrar por período
      </p>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.filter((p) => p.key !== "custom").map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => applyPreset(p.key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
              currentPreset === p.key
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom range */}
      <div className="flex flex-wrap items-end gap-2 pt-1">
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">De</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">Até</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="button"
          disabled={!from || !to}
          onClick={applyCustom}
          className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          Aplicar
        </button>
        {currentPreset === "custom" && customFrom && customTo && (
          <span className="text-[11px] text-blue-600 font-medium">
            ✓ {customFrom} → {customTo}
          </span>
        )}
      </div>
    </div>
  );
}

