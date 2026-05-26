import { z } from "zod";

export const APPOINTMENT_STATUS_VALUES = [
  "scheduled",
  "completed",
  "cancelled",
  "no_show",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUS_VALUES)[number];

export const createAgendamentoSchema = z.object({
  clientId: z.string().min(1, "Cliente é obrigatório"),
  collaboratorId: z.string().min(1, "Colaborador é obrigatório"),
  serviceId: z.string().min(1, "Serviço é obrigatório"),
  startDateTime: z.string().min(1, "Data/hora de início é obrigatória"),
  endDateTime: z.string().min(1, "Data/hora de término é obrigatória"),
  status: z.enum(APPOINTMENT_STATUS_VALUES).default("scheduled"),
  notes: z.string().optional(),
});

export const updateAgendamentoSchema = createAgendamentoSchema.partial();

export const cancelAgendamentoSchema = z.object({
  id: z.string().min(1),
});

export type CreateAgendamentoInput = z.infer<typeof createAgendamentoSchema>;
export type UpdateAgendamentoInput = z.infer<typeof updateAgendamentoSchema>;

