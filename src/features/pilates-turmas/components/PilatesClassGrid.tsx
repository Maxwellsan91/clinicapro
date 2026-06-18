"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FREQUENCY_LABELS, FREQUENCY_STYLES, formatScheduleLabel, type PilatesFrequency } from "../schema";
import {
  pausePilatesClassEnrollmentAction,
  removeClientFromPilatesClassAction,
} from "../actions";
import type { PilatesClassView, PilatesEnrollmentView, PilatesScheduleView } from "../types";

interface Props {
  pilatesClass: PilatesClassView;
}

export function PilatesClassGrid({ pilatesClass }: Props) {
  const [isPending, startTransition] = useTransition();
  const schedules = pilatesClass.schedules;

  const cellByScheduleAndSlot = new Map<string, PilatesEnrollmentView>();
  for (const enrollment of pilatesClass.enrollments) {
    if (enrollment.status !== "active") continue;
    for (const day of enrollment.days) {
      cellByScheduleAndSlot.set(`${day.scheduleId}:${day.slotNumber}`, enrollment);
    }
  }

  const activeEnrollments = pilatesClass.enrollments.filter((enrollment) => enrollment.status === "active");

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="sticky left-0 z-10 border-b border-r border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">Vaga</th>
              {schedules.map((schedule: PilatesScheduleView) => (
                <th key={schedule.id} className="border-b border-r border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">
                  {formatScheduleLabel(schedule)}
                  <span className="ml-2 text-xs font-normal text-gray-500">{schedule.duration} min</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: pilatesClass.capacity }, (_, index) => index + 1).map((slot) => (
              <tr key={slot} className="hover:bg-gray-50">
                <td className="sticky left-0 z-10 border-r border-t border-gray-200 bg-white px-3 py-2 font-semibold text-gray-700">{slot}</td>
                {schedules.map((schedule: PilatesScheduleView) => {
                  const enrollment = cellByScheduleAndSlot.get(`${schedule.id}:${slot}`);
                  const frequency = enrollment?.frequency as PilatesFrequency | undefined;
                  return (
                    <td key={schedule.id} className="border-r border-t border-gray-200 p-1.5">
                      {enrollment ? (
                        <div className={`rounded-md border px-2.5 py-2 ${FREQUENCY_STYLES[frequency ?? "once_week"]}`}>
                          <p className="font-medium leading-tight">{enrollment.client.name}</p>
                          <p className="text-[11px] leading-tight opacity-80">{FREQUENCY_LABELS[frequency ?? "once_week"]}</p>
                        </div>
                      ) : (
                        <div className={`rounded-md border px-2.5 py-2 text-center font-medium ${FREQUENCY_STYLES.vacant}`}>
                          VAGA
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeEnrollments.length > 0 && (
        <div className="rounded-md border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Inscrições ativas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {activeEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between gap-3 rounded-md border border-gray-200 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{enrollment.client.name}</p>
                  <p className="text-xs text-gray-500">{FREQUENCY_LABELS[enrollment.frequency as PilatesFrequency]} · {enrollment.days.length} horário(s)</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => startTransition(() => { void pausePilatesClassEnrollmentAction(enrollment.id, pilatesClass.id); })}
                  >
                    Pausar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    disabled={isPending}
                    onClick={() => {
                      if (!confirm("Remover aluno desta turma?")) return;
                      startTransition(() => { void removeClientFromPilatesClassAction(enrollment.id, pilatesClass.id); });
                    }}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
