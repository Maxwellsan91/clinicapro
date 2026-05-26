"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TENANT_ID } from "@/constants";
import { createPagamentoSchema, updatePagamentoSchema } from "./schema";
import * as repo from "./repository";

export async function createPagamentoAction(formData: FormData) {
  const raw = {
    clientId: formData.get("clientId") as string,
    appointmentId: formData.get("appointmentId") as string,
    amount: formData.get("amount"),
    paymentMethod: formData.get("paymentMethod") as string,
    status: formData.get("status") as string,
    paidAt: formData.get("paidAt") as string,
    dueDate: formData.get("dueDate") as string,
    notes: formData.get("notes") as string,
    invoiceStatus: formData.get("invoiceStatus") as string,
    invoiceNumber: formData.get("invoiceNumber") as string,
    invoiceExternalUrl: formData.get("invoiceExternalUrl") as string,
  };

  const result = createPagamentoSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  try {
    await repo.createPagamento(TENANT_ID, result.data);
    revalidatePath("/pagamentos");
  } catch {
    return {
      success: false,
      error: { _global: ["Erro ao criar pagamento"] },
    };
  }

  redirect("/pagamentos");
}

export async function updatePagamentoAction(id: string, formData: FormData) {
  const raw = {
    clientId: formData.get("clientId") as string,
    appointmentId: formData.get("appointmentId") as string,
    amount: formData.get("amount"),
    paymentMethod: formData.get("paymentMethod") as string,
    status: formData.get("status") as string,
    paidAt: formData.get("paidAt") as string,
    dueDate: formData.get("dueDate") as string,
    notes: formData.get("notes") as string,
    invoiceStatus: formData.get("invoiceStatus") as string,
    invoiceNumber: formData.get("invoiceNumber") as string,
    invoiceExternalUrl: formData.get("invoiceExternalUrl") as string,
  };

  const result = updatePagamentoSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  try {
    await repo.updatePagamento(id, TENANT_ID, result.data);
    revalidatePath("/pagamentos");
    revalidatePath(`/pagamentos/${id}`);
  } catch {
    return {
      success: false,
      error: { _global: ["Erro ao actualizar pagamento"] },
    };
  }

  redirect("/pagamentos");
}

export async function markAsPaidAction(id: string) {
  try {
    await repo.markAsPaid(id, TENANT_ID);
    revalidatePath("/pagamentos");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao marcar como pago" };
  }
}

export async function markAsPendingAction(id: string) {
  try {
    await repo.markAsPending(id, TENANT_ID);
    revalidatePath("/pagamentos");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao marcar como pendente" };
  }
}

export async function deletePagamentoAction(id: string) {
  try {
    await repo.deletePagamento(id, TENANT_ID);
    revalidatePath("/pagamentos");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao eliminar pagamento" };
  }
}

