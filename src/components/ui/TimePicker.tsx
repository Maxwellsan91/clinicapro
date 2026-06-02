"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  startHour?: number;
  endHour?: number;
  intervalMinutes?: number;
  className?: string;
}

function generateSlots(start: number, end: number, interval: number): string[] {
  const slots: string[] = [];
  for (let h = start; h <= end; h++) {
    for (let m = 0; m < 60; m += interval) {
      if (h === end && m > 0) break;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

export function TimePicker({
  value = "",
  onChange,
  placeholder = "hh:mm",
  startHour = 7,
  endHour = 22,
  intervalMinutes = 15,
  className,
}: TimePickerProps) {
  const [isOpen, setIsOpen]     = useState(false);
  const [menuTop, setMenuTop]   = useState(0);
  const [menuLeft, setMenuLeft] = useState(0);
  const [menuWidth, setMenuWidth] = useState(128);
  const btnRef  = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const slots = generateSlots(startHour, endHour, intervalMinutes);

  function handleButtonClick() {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuTop(Math.round(rect.bottom) + 4);
      setMenuLeft(Math.round(rect.left));
      setMenuWidth(Math.max(Math.round(rect.width), 128));
    }
    setIsOpen(true);
  }

  function handleSelect(slot: string) {
    onChange?.(slot);
    setIsOpen(false);
  }

  // Scroll para o item selecionado ao abrir
  useLayoutEffect(() => {
    if (!isOpen || !menuRef.current) return;
    const sel = menuRef.current.querySelector<HTMLElement>("[data-selected='true']");
    if (sel) sel.scrollIntoView({ block: "center", behavior: "instant" });
  }, [isOpen]);

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
        <span>{value || placeholder}</span>
        <Clock className="w-4 h-4 text-gray-400 shrink-0" />
      </button>

      {/*
        position:fixed → posicionado relativo ao viewport,
        nunca cortado por overflow de um elemento pai.
        Não precisa de createPortal.
      */}
      {isOpen && (
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top:      menuTop,
            left:     menuLeft,
            width:    menuWidth,
            zIndex:   9999,
          }}
          className="rounded-xl border border-gray-200 bg-white shadow-xl py-1 max-h-52 overflow-y-auto"
        >
          {slots.map((slot) => {
            const selected = slot === value;
            return (
              <button
                key={slot}
                type="button"
                data-selected={selected}
                onClick={() => handleSelect(slot)}
                className={cn(
                  "w-full px-4 py-1.5 text-left text-sm transition-colors",
                  selected
                    ? "bg-blue-600 text-white font-semibold"
                    : "text-gray-700 hover:bg-gray-100",
                )}
              >
                {slot}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
