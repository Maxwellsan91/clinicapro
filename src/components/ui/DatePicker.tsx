"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "./calendar";

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

/** "YYYY-MM-DD" → "dd/MM/yyyy" */
function formatDisplay(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** Date → "YYYY-MM-DD" */
function toISO(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "YYYY-MM-DD" → Date (hora 00:00 local) */
function fromISO(iso: string): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function DatePicker({
  value = "",
  onChange,
  placeholder = "dd/mm/aaaa",
  className,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuTop, setMenuTop]   = useState(0);
  const [menuLeft, setMenuLeft] = useState(0);
  const btnRef  = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function handleButtonClick() {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuTop(Math.round(rect.bottom) + 4);
      setMenuLeft(Math.min(Math.round(rect.left), window.innerWidth - 304));
    }
    setIsOpen(true);
  }

  function handleSelect(date: Date) {
    onChange?.(toISO(date));
    setIsOpen(false);
  }

  // Fechar ao clicar fora
  useEffect(() => {
    if (!isOpen) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !menuRef.current?.contains(t)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [isOpen]);

  // Fechar ao fazer scroll
  useEffect(() => {
    if (!isOpen) return;
    function onScroll() { setIsOpen(false); }
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [isOpen]);

  return (
    <div className="relative w-full">
      <button
        ref={btnRef}
        type="button"
        onClick={handleButtonClick}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm",
          "hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
          value ? "text-gray-900" : "text-gray-400",
          className,
        )}
      >
        <span>{value ? formatDisplay(value) : placeholder}</span>
        <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
      </button>

      {/*
        position:fixed → posicionado relativo ao viewport,
        nunca cortado por overflow de um elemento pai.
        Não precisa de createPortal.
      */}
      {isOpen && (
        <div
          ref={menuRef}
          style={{ position: "fixed", top: menuTop, left: menuLeft, zIndex: 9999 }}
          className="rounded-xl border border-gray-200 bg-white shadow-xl"
        >
          <Calendar
            selected={fromISO(value)}
            onSelect={handleSelect}
            minDate={minDate}
            maxDate={maxDate}
          />
        </div>
      )}
    </div>
  );
}
