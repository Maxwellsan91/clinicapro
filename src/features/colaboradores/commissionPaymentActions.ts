"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createCommissionPayment, deleteCommissionPayment } from "@/features/colaboradores/repository";
import { isAdmin } from "@/features/auth/actions";
import { TENANT_ID } from "@/constants";

const createSchema = z.object({
  colaboradorId: z.string().min(1, "Colaborador obrigatório"),
  amount:        z.coerce.number().positive("O valor deve ser positivo"),
  type:          z.enum(["payment", "advance"]),
  allocationType: z.enum(["current_period", "previous_balance"]),
  notes:         z.string().optional(),
  paidAt:        z.string().min(1, "Data obrigatória"),
});

export type CommissionPaymentActionResult =
  | { success: true }
  | { success: false; error: string };

export async function createCommissionPaymentAction(
  formData: FormData,
): Promise<CommissionPaymentActionResult> {
  if (!(await isAdmin())) return { success: false, error: "Sem permissão." };

  const raw = {
    colaboradorId: formData.get("colaboradorId") as string,
    amount:        formData.get("amount") as string,
    type:          formData.get("type") as string,
    allocationType: formData.get("allocationType") as string,
    notes:         formData.get("notes") as string | undefined,
    paidAt:        formData.get("paidAt") as string,
  };

  const result = createSchema.safeParse(raw);
  if (!result.success) {
    const first = Object.values(result.error.flatten().fieldErrors).flat()[0];
    return { success: false, error: first ?? "Dados inválidos" };
  }

  const { colaboradorId, amount, type, allocationType, notes, paidAt } = result.data;

  await createCommissionPayment(TENANT_ID, colaboradorId, {
    amount,
    type,
    allocationType,
    notes:         notes || undefined,
    paidAt:        new Date(paidAt + "T12:00:00"),
  });

  revalidatePath(`/comissoes/${colaboradorId}`);
  revalidatePath("/comissoes");
  return { success: true };
}

export async function deleteCommissionPaymentAction(
  id: string,
  colaboradorId: string,
): Promise<CommissionPaymentActionResult> {
  if (!(await isAdmin())) return { success: false, error: "Sem permissão." };

  await deleteCommissionPayment(id, TENANT_ID);

  revalidatePath(`/comissoes/${colaboradorId}`);
  revalidatePath("/comissoes");
  return { success: true };
}
