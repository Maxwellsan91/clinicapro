import { z } from "zod";

export const DAY_LABELS: Record<number, string> = {
  1: "Segunda",
  2: "Terça",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
  6: "Sábado",
  7: "Domingo",
};

export const FREQUENCIES = [
  "once_week",
  "twice_week",
  "three_times_week",
  "rotating",
  "trial",
] as const;

export type PilatesFrequency = (typeof FREQUENCIES)[number];

export const FREQUENCY_LABELS: Record<PilatesFrequency, string> = {
  once_week: "1x semana",
  twice_week: "2x semana",
  three_times_week: "3x semana",
  rotating: "Rotativo",
  trial: "Experimental",
};

export const FREQUENCY_STYLES: Record<PilatesFrequency | "vacant", string> = {
  once_week: "bg-blue-100 text-blue-900 border-blue-300",
  twice_week: "bg-red-100 text-red-900 border-red-300",
  three_times_week: "bg-yellow-100 text-yellow-900 border-yellow-300",
  rotating: "bg-red-100 text-red-900 border-red-300",
  trial: "bg-purple-100 text-purple-900 border-purple-300",
  vacant: "bg-green-100 text-green-900 border-green-300",
};

export const ENROLLMENT_STATUSES = [
  "active",
  "paused",
  "cancelled",
  "waiting_list",
] as const;

export type PilatesEnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

export const ENROLLMENT_STATUS_LABELS: Record<PilatesEnrollmentStatus, string> = {
  active: "Ativa",
  paused: "Pausada",
  cancelled: "Cancelada",
  waiting_list: "Lista de espera",
};

export const ACTIVE_OCCUPANCY_STATUSES = ["active", "waiting_list"] as const;

const optionalId = z.string().trim().optional().transform((value) => value || undefined);

export const pilatesScheduleSchema = z.object({
  id: z.string().optional(),
  dayOfWeek: z.coerce.number().int().min(1, "Dia inválido").max(7, "Dia inválido"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora inválida"),
  duration: z.coerce.number().int().min(1, "Duração deve ser maior que 0"),
});

export const createPilatesClassSchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório"),
  serviceId: optionalId,
  collaboratorId: optionalId,
  resourceId: optionalId,
  capacity: z.coerce.number().int().min(1, "Capacidade deve ser maior que 0"),
  isActive: z.coerce.boolean().default(true),
  notes: z.string().trim().optional().transform((value) => value || undefined),
  schedules: z.array(pilatesScheduleSchema).min(1, "Adicione pelo menos um horário"),
}).superRefine((data, ctx) => {
  const seen = new Set<string>();
  data.schedules.forEach((schedule, index) => {
    const key = `${schedule.dayOfWeek}-${schedule.startTime}`;
    if (seen.has(key)) {
      ctx.addIssue({
        code: "custom",
        path: ["schedules", index, "startTime"],
        message: "Não é permitido duplicar dia e hora na mesma turma",
      });
    }
    seen.add(key);
  });
});

export const updatePilatesClassSchema = createPilatesClassSchema;

const enrollmentDaysSchema = z.array(z.object({
  scheduleId: z.string().min(1),
  slotNumber: z.coerce.number().int().min(1, "Vaga inválida"),
})).min(1, "Selecione pelo menos um horário");

function refineUniqueEnrollmentSchedules(
  data: { days: Array<{ scheduleId: string }> },
  ctx: z.RefinementCtx
) {
  const seen = new Set<string>();
  data.days.forEach((day, index) => {
    if (seen.has(day.scheduleId)) {
      ctx.addIssue({
        code: "custom",
        path: ["days", index, "scheduleId"],
        message: "O mesmo horário foi selecionado mais de uma vez",
      });
    }
    seen.add(day.scheduleId);
  });
}

const enrollPilatesClassBaseSchema = z.object({
  classId: z.string().min(1),
  clientId: z.string().min(1, "Cliente obrigatório"),
  frequency: z.enum(FREQUENCIES, { error: "Frequência inválida" }),
  status: z.enum(ENROLLMENT_STATUSES, { error: "Status inválido" }).default("active"),
  startDate: z.string().optional().transform((value) => value ? new Date(value) : undefined),
  notes: z.string().trim().optional().transform((value) => value || undefined),
  days: enrollmentDaysSchema,
});

export const enrollPilatesClassSchema = enrollPilatesClassBaseSchema
  .superRefine(refineUniqueEnrollmentSchedules);

export const updatePilatesEnrollmentSchema = enrollPilatesClassBaseSchema
  .omit({ classId: true })
  .extend({
    status: z.enum(ENROLLMENT_STATUSES, { error: "Status inválido" }),
    endDate: z.string().optional().transform((value) => value ? new Date(value) : undefined),
  })
  .superRefine(refineUniqueEnrollmentSchedules);

export type PilatesScheduleInput = z.infer<typeof pilatesScheduleSchema>;
export type CreatePilatesClassInput = z.infer<typeof createPilatesClassSchema>;
export type UpdatePilatesClassInput = z.infer<typeof updatePilatesClassSchema>;
export type EnrollPilatesClassInput = z.infer<typeof enrollPilatesClassSchema>;
export type UpdatePilatesEnrollmentInput = z.infer<typeof updatePilatesEnrollmentSchema>;

export function formatScheduleLabel(schedule: { dayOfWeek: number; startTime: string }) {
  return `${DAY_LABELS[schedule.dayOfWeek] ?? schedule.dayOfWeek} ${schedule.startTime}`;
}
