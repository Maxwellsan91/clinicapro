"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { CalendarDays } from "lucide-react";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

interface MonthYearSelectorProps {
  year: number;
  month: number;
  basePath?: string;
  showMonth?: boolean;
}

export function MonthYearSelector({ year, month, basePath = "/financeiro", showMonth = true }: MonthYearSelectorProps) {
  const router = useRouter();
  const years = Array.from({ length: 7 }, (_, index) => new Date().getFullYear() - 3 + index);

  function submit(formData: FormData) {
    const selectedYear = formData.get("year");
    const selectedMonth = formData.get("month");
    const query = showMonth ? `year=${selectedYear}&month=${selectedMonth}` : `year=${selectedYear}`;
    router.push(`${basePath}?${query}`);
  }

  return (
    <form action={submit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="grid grid-cols-2 gap-2 sm:flex">
        {showMonth && (
          <Select name="month" defaultValue={String(month)} aria-label="Mês" className="sm:w-40">
            {MONTHS.map((label, index) => (
              <option key={label} value={index + 1}>{label}</option>
            ))}
          </Select>
        )}
        <Select name="year" defaultValue={String(year)} aria-label="Ano" className="sm:w-28">
          {years.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </Select>
      </div>
      <Button type="submit" variant="outline" className="gap-2">
        <CalendarDays className="h-4 w-4" />
        Ver período
      </Button>
    </form>
  );
}
