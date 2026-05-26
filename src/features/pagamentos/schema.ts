import { z } from "zod";

export const PAYMENT_STATUS_VALUES = [
  "pending",
  "paid",
  "partial",
  "cancelled",
] as const;

export const INVOICE_STATUS_VALUES = ["not_issued", "issued"] as const;

export const PAYMENT_METHOD_VALUES = [
  "Numerário",
  "Multibanco",
  "MBWay",
  "Transferência Bancária",
  "Cartão de Crédito",
  "Cartão de Débito",
  "Cheque",
  "Outro",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUS_VALUES)[number];
export type InvoiceStatus = (typeof INVOICE_STATUS_VALUES)[number];

export const createPagamentoSchema = z.object({
  clientId: z.string().min(1, "Utente é obrigatório"),
  appointmentId: z.string().optional().or(z.literal("")),
  amount: z.coerce
    .number()
    .min(0.01, "O valor deve ser superior a 0"),
  paymentMethod: z.string().optional(),
  status: z.enum(PAYMENT_STATUS_VALUES).default("pending"),
  paidAt: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  invoiceStatus: z.enum(INVOICE_STATUS_VALUES).default("not_issued"),
  invoiceNumber: z.string().optional(),
  invoiceExternalUrl: z
    .string()
    .url("URL inválido")
    .optional()
    .or(z.literal("")),
});

export const updatePagamentoSchema = createPagamentoSchema.partial();

export type CreatePagamentoInput = z.infer<typeof createPagamentoSchema>;
export type UpdatePagamentoInput = z.infer<typeof updatePagamentoSchema>;

