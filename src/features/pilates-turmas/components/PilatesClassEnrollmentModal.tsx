"use client";

import { useMemo, useState } from "react";
import { UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { enrollClientInPilatesClassAction } from "../actions";
import { ENROLLMENT_STATUS_LABELS, ENROLLMENT_STATUSES, FREQUENCIES, FREQUENCY_LABELS, formatScheduleLabel, type PilatesEnrollmentStatus, type PilatesFrequency } from "../schema";
import { AvailableSlotSelect } from "./AvailableSlotSelect";
import type { ActionResult, PilatesClassView, PilatesScheduleView } from "../types";

interface Props {
  pilatesClass: PilatesClassView;
  clients: { id: string; name: string }[];
}

export function PilatesClassEnrollmentModal({ pilatesClass, clients }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, { checked: boolean; slotNumber: number }>>({});

  const occupiedBySchedule = useMemo(() => {
    const map: Record<string, number[]> = {};
    for (const schedule of pilatesClass.schedules) map[schedule.id] = [];
    for (const enrollment of pilatesClass.enrollments) {
      if (enrollment.status !== "active") continue;
      for (const day of enrollment.days) {
        map[day.scheduleId] = [...(map[day.scheduleId] ?? []), day.slotNumber];
      }
    }
    return map;
  }, [pilatesClass]);

  const daysJson = useMemo(() => JSON.stringify(
    Object.entries(selected)
      .filter(([, value]) => value.checked)
      .map(([scheduleId, value]) => ({ scheduleId, slotNumber: value.slotNumber }))
  ), [selected]);

  function defaultSlot(scheduleId: string) {
    const occupied = new Set(occupiedBySchedule[scheduleId] ?? []);
    for (let slot = 1; slot <= pilatesClass.capacity; slot += 1) {
      if (!occupied.has(slot)) return slot;
    }
    return 1;
  }

  async function submit(formData: FormData) {
    setError(null);
    formData.set("days", daysJson);
    const result = await enrollClientInPilatesClassAction(pilatesClass.id, formData) as ActionResult | undefined;
    if (result?.success === false) {
      const errors = typeof result.error === "string" ? { _global: [result.error] } : result.error;
      const global = errors?._global?.[0];
      const firstField = Object.values(errors ?? {}).flat()[0];
      setError(String(global ?? firstField ?? "Verifique os dados da inscrição."));
      return;
    }
    setOpen(false);
    setSelected({});
  }

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} disabled={!pilatesClass.isActive}>
        <UserPlus className="w-4 h-4" />
        Inscrever aluno
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Inscrever aluno</h2>
                <p className="text-sm text-gray-500">{pilatesClass.name}</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Fechar">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form action={submit} className="space-y-4 p-5">
              {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
              <input type="hidden" name="days" value={daysJson} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="clientId">Cliente</Label>
                  <Select id="clientId" name="clientId" required defaultValue="">
                    <option value="" disabled>Selecionar cliente</option>
                    {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="frequency">Frequência</Label>
                  <Select id="frequency" name="frequency" defaultValue="once_week">
                    {FREQUENCIES.map((frequency) => <option key={frequency} value={frequency}>{FREQUENCY_LABELS[frequency as PilatesFrequency]}</option>)}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="status">Status</Label>
                  <Select id="status" name="status" defaultValue="active">
                    {ENROLLMENT_STATUSES.map((status) => <option key={status} value={status}>{ENROLLMENT_STATUS_LABELS[status as PilatesEnrollmentStatus]}</option>)}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="startDate">Data de início</Label>
                  <Input id="startDate" name="startDate" type="date" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea id="notes" name="notes" rows={2} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Horários e vagas</Label>
                {pilatesClass.schedules.map((schedule: PilatesScheduleView) => {
                  const current = selected[schedule.id] ?? { checked: false, slotNumber: defaultSlot(schedule.id) };
                  return (
                    <div key={schedule.id} className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-3 rounded-md border border-gray-200 p-3">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
                        <input
                          type="checkbox"
                          checked={current.checked}
                          onChange={(event) => setSelected((prev) => ({
                            ...prev,
                            [schedule.id]: { ...current, checked: event.target.checked },
                          }))}
                        />
                        {formatScheduleLabel(schedule)}
                      </label>
                      <AvailableSlotSelect
                        capacity={pilatesClass.capacity}
                        occupiedSlots={occupiedBySchedule[schedule.id] ?? []}
                        value={current.slotNumber}
                        onChange={(slotNumber) => setSelected((prev) => ({
                          ...prev,
                          [schedule.id]: { ...current, slotNumber },
                        }))}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar inscrição</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
