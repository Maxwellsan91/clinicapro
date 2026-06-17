import { z } from "zod";

export const FINANCIAL_GROUPS = [
  "Pessoal",
  "Despesas Fixas",
  "Despesas Variáveis",
  "Impostos e Contribuições",
  "Seguros",
  "Poupança e Reservas",
  "Investimento",
  "Receitas",
] as const;

export const FINANCIAL_TYPES = [
  "expense",
  "tax",
  "insurance",
  "investment",
  "savings",
  "revenue",
] as const;

export type FinancialGroup = (typeof FINANCIAL_GROUPS)[number];
export type FinancialType = (typeof FINANCIAL_TYPES)[number];

const optionalMoney = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().min(0, "O valor não pode ser negativo").optional()
);

export const financialCategorySchema = z.object({
  name: z.string().trim().min(2, "Nome obrigatório"),
  group: z.enum(FINANCIAL_GROUPS),
  type: z.enum(FINANCIAL_TYPES),
  defaultValue: optionalMoney,
  order: z.coerce.number().int().min(0, "A ordem não pode ser negativa").default(0),
  isActive: z.preprocess((value) => value === "on" || value === true, z.boolean()).default(false),
});

export const updateFinancialCategorySchema = financialCategorySchema.partial({
  defaultValue: true,
  order: true,
  isActive: true,
});

export const monthYearSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

export const monthlyEntrySchema = z.object({
  categoryId: z.string().min(1),
  plannedValue: optionalMoney,
  actualValue: optionalMoney,
  notes: z.string().trim().optional(),
});

export const saveMonthSchema = monthYearSchema.extend({
  manualRevenueAdjustment: optionalMoney,
  savingsAmount: optionalMoney,
  notes: z.string().trim().optional(),
  entries: z.array(monthlyEntrySchema),
});

export const financialEntrySchema = z.object({
  date: z.string().min(1, "Data obrigatória"),
  categoryId: z.string().min(1, "Categoria obrigatória"),
  value: z.coerce.number().min(0.01, "O valor deve ser superior a 0"),
  description: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type FinancialCategoryInput = z.infer<typeof financialCategorySchema>;
export type SaveMonthInput = z.infer<typeof saveMonthSchema>;
export type FinancialEntryInput = z.infer<typeof financialEntrySchema>;
