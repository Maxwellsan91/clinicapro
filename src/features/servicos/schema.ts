import { z } from "zod";

export const createServicoSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  duration: z.coerce.number().min(1, "Duração deve ser positiva"),
  price: z.coerce.number().min(0, "Preço deve ser positivo"),
  category: z.string().optional(),
  isActive: z.coerce.boolean().default(true),
});

export const updateServicoSchema = createServicoSchema.partial();

export type CreateServicoInput = z.infer<typeof createServicoSchema>;
export type UpdateServicoInput = z.infer<typeof updateServicoSchema>;

