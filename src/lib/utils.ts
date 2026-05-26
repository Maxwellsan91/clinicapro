import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
}

/**
 * Serializes Prisma Decimal fields to plain numbers so objects
 * can safely be passed from Server Components to Client Components.
 */
export function serializeDecimal<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

