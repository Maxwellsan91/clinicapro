"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { DAY_LABELS } from "../schema";

export interface ScheduleDraft {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  duration: number;
}

interface Props {
  schedules: ScheduleDraft[];
  onChange: (schedules: ScheduleDraft[]) => void;
}

export function PilatesClassScheduleEditor({ schedules, onChange }: Props) {
  function update(index: number, patch: Partial<ScheduleDraft>) {
    onChange(schedules.map((schedule, i) => i === index ? { ...schedule, ...patch } : schedule));
  }

  function add() {
    onChange([...schedules, { dayOfWeek: 1, startTime: "19:15", duration: 50 }]);
  }

  function remove(index: number) {
    onChange(schedules.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Horários da turma</h3>
          <p className="text-xs text-gray-500">Configure um ou mais dias, com hora e duração independentes.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="w-4 h-4" />
          Adicionar horário
        </Button>
      </div>

      <div className="space-y-2">
        {schedules.map((schedule, index) => (
          <div key={schedule.id ?? index} className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr_auto] gap-3 rounded-md border border-gray-200 bg-white p-3">
            <div className="space-y-1.5">
              <Label>Dia da semana</Label>
              <Select
                value={String(schedule.dayOfWeek)}
                onChange={(event) => update(index, { dayOfWeek: Number(event.target.value) })}
              >
                {Object.entries(DAY_LABELS).map(([day, label]) => (
                  <option key={day} value={day}>{label}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Hora de início</Label>
              <Input
                type="time"
                value={schedule.startTime}
                onChange={(event) => update(index, { startTime: event.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Duração</Label>
              <Input
                type="number"
                min={1}
                value={schedule.duration}
                onChange={(event) => update(index, { duration: Number(event.target.value) })}
              />
            </div>
            <div className="flex md:items-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => remove(index)}
                aria-label="Remover horário"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {schedules.length === 0 && (
        <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          Adicione pelo menos um horário para criar a turma.
        </div>
      )}
    </div>
  );
}
