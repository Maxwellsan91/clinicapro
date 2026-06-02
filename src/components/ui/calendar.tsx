"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril",
  "Maio", "Junho", "Julho", "Agosto",
  "Setembro", "Outubro", "Novembro", "Dezembro",
];

interface CalendarProps {
  selected?: Date | null;
  onSelect?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

export function Calendar({ selected, onSelect, minDate, maxDate }: CalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth());

  const daysInMonth     = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0=Dom

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  }

  function isSelected(day: number) {
    if (!selected) return false;
    const s = new Date(selected);
    s.setHours(0, 0, 0, 0);
    return s.getDate() === day && s.getMonth() === viewMonth && s.getFullYear() === viewYear;
  }
  function isToday(day: number) {
    return today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear;
  }
  function isDisabled(day: number) {
    const d = new Date(viewYear, viewMonth, day);
    if (minDate && d < minDate) return true;
    if (maxDate && d > maxDate) return true;
    return false;
  }

  // Build cell array: null for empty leading cells, number for days
  const cells: (number | null)[] = [
    ...Array<null>(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="p-4 select-none w-[288px]">
      {/* ── Month navigation ── */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-gray-800">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Próximo mês"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Weekday headers ── */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      {/* ── Day cells ── */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) =>
          day === null ? (
            <div key={`empty-${i}`} />
          ) : (
            <button
              key={day}
              type="button"
              disabled={isDisabled(day)}
              onClick={() => !isDisabled(day) && onSelect?.(new Date(viewYear, viewMonth, day))}
              className={cn(
                "mx-auto w-9 h-9 rounded-full text-sm flex items-center justify-center transition-colors font-medium",
                isSelected(day)
                  ? "bg-blue-600 text-white shadow-sm"
                  : isToday(day)
                  ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                  : "text-gray-700 hover:bg-gray-100",
                isDisabled(day) && "opacity-30 cursor-not-allowed pointer-events-none",
              )}
            >
              {day}
            </button>
          )
        )}
      </div>

      {/* ── Today shortcut ── */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-center">
        <button
          type="button"
          onClick={() => {
            onSelect?.(new Date(today));
            setViewYear(today.getFullYear());
            setViewMonth(today.getMonth());
          }}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          Hoje
        </button>
      </div>
    </div>
  );
}

