"use client";

import { Select } from "@/components/ui/select";

interface Props {
  capacity: number;
  occupiedSlots: number[];
  value: number;
  onChange: (slot: number) => void;
}

export function AvailableSlotSelect({ capacity, occupiedSlots, value, onChange }: Props) {
  const occupied = new Set(occupiedSlots);
  return (
    <Select value={String(value)} onChange={(event) => onChange(Number(event.target.value))}>
      {Array.from({ length: capacity }, (_, index) => index + 1).map((slot) => (
        <option key={slot} value={slot} disabled={occupied.has(slot)}>
          Vaga {slot}{occupied.has(slot) ? " - ocupada" : ""}
        </option>
      ))}
    </Select>
  );
}
