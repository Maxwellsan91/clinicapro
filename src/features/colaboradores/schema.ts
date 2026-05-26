import { z } from "zod";

export const createColaboradorSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  role: z.string().min(1, "Cargo é obrigatório"),
  specialty: z.string().optional(),
});

export const updateColaboradorSchema = createColaboradorSchema.partial();

export type CreateColaboradorInput = z.infer<typeof createColaboradorSchema>;
export type UpdateColaboradorInput = z.infer<typeof updateColaboradorSchema>;

