"use client";

import { useState, useEffect } from "react";
import { DatePicker } from "./DatePicker";
import { TimePicker } from "./TimePicker";

interface DateTimePickerProps {
  name: string;
  /** Valor controlado no formato ISO parcial "YYYY-MM-DDTHH:mm" */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  startHour?: number;
  endHour?: number;
}

function split(dt: string): { date: string; time: string } {
  if (!dt) return { date: "", time: "" };
  const [d, t] = dt.split("T");
  return { date: d ?? "", time: t?.slice(0, 5) ?? "" };
}

export function DateTimePicker({
  name,
  value,
  defaultValue = "",
  onChange,
  startHour,
  endHour,
}: DateTimePickerProps) {
  const controlled = value !== undefined;
  const init = split(controlled ? (value ?? "") : defaultValue);
  const [date, setDate] = useState(init.date);
  const [time, setTime] = useState(init.time);

  // Sincronizar com prop `value` quando modo controlado
  useEffect(() => {
    if (controlled) {
      const parts = split(value ?? "");
      setDate(parts.date);
      setTime(parts.time);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const combined = date && time ? `${date}T${time}` : "";

  function handleDateChange(val: string) {
    setDate(val);
    onChange?.(val && time ? `${val}T${time}` : "");
  }

  function handleTimeChange(val: string) {
    setTime(val);
    onChange?.(date && val ? `${date}T${val}` : "");
  }

  return (
    <div className="flex gap-2">
      <input type="hidden" name={name} value={combined} />
      <div className="flex-1">
        <DatePicker value={date} onChange={handleDateChange} />
      </div>
      <div className="w-32">
        <TimePicker
          value={time}
          onChange={handleTimeChange}
          startHour={startHour}
          endHour={endHour}
        />
      </div>
    </div>
  );
}
