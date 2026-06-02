import { z } from "zod";

export const RESOURCE_TYPES = ["room", "equipment", "gym"] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  room:      "Sala / Gabinete",
  equipment: "Equipamento",
  gym:       "Ginásio",
};

export const createRecursoSchema = z.object({
  name:     z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  type:     z.enum(RESOURCE_TYPES, { error: "Tipo inválido" }),
  capacity: z.coerce.number().int().min(1, "Capacidade mínima é 1").default(1),
  isActive: z.coerce.boolean().default(true),
});

export const updateRecursoSchema = createRecursoSchema.partial();

export type CreateRecursoInput = z.infer<typeof createRecursoSchema>;
export type UpdateRecursoInput = z.infer<typeof updateRecursoSchema>;

