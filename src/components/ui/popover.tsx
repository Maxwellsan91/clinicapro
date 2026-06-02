"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface PopoverProps {
  open: boolean;
  onClose: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}

/**
 * Lightweight popover sem dependências externas.
 * Fecha ao clicar fora do container.
 */
export function Popover({
  open,
  onClose,
  trigger,
  children,
  align = "left",
  className,
}: PopoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Guardar onClose em ref para evitar re-add de listener em cada render
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onCloseRef.current();
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  return (
    <div ref={containerRef} className="relative w-full">
      {trigger}
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1 rounded-xl border border-gray-200 bg-white shadow-xl",
            align === "left"   && "left-0",
            align === "right"  && "right-0",
            align === "center" && "left-1/2 -translate-x-1/2",
            className,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

