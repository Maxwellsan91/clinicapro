"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TENANT_ID } from "@/constants";
import { isAdmin, getUser } from "@/features/auth/actions";
import { createAuditLog } from "@/lib/audit";
import { createPagamentoSchema, updatePagamentoSchema } from "./schema";
import * as repo from "./repository";

async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Error("Sem permissão");
  }
}

export async function createPagamentoAction(formData: FormData) {
  await requireAdmin();
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
    const pagamento = await repo.createPagamento(TENANT_ID, result.data);
    const user = await getUser();
    await createAuditLog({
      userId: user?.id ?? "unknown",
      userEmail: user?.email,
      action: "CREATE",
      entity: "Pagamento",
      entityId: pagamento.id,
      metadata: { amount: result.data.amount, status: result.data.status, clientId: result.data.clientId },
    });
    revalidatePath("/pagamentos");
  } catch {
    return { success: false, error: { _global: ["Erro ao criar pagamento"] } };
  }

  redirect("/pagamentos");
}

export async function updatePagamentoAction(id: string, formData: FormData) {
  await requireAdmin();
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
    const user = await getUser();
    await createAuditLog({
      userId: user?.id ?? "unknown",
      userEmail: user?.email,
      action: "UPDATE",
      entity: "Pagamento",
      entityId: id,
      metadata: { amount: result.data.amount, status: result.data.status },
    });
    revalidatePath("/pagamentos");
    revalidatePath(`/pagamentos/${id}`);
  } catch {
    return { success: false, error: { _global: ["Erro ao actualizar pagamento"] } };
  }

  redirect("/pagamentos");
}

export async function markAsPaidAction(id: string) {
  await requireAdmin();
  try {
    await repo.markAsPaid(id, TENANT_ID);
    const user = await getUser();
    await createAuditLog({
      userId: user?.id ?? "unknown",
      userEmail: user?.email,
      action: "MARK_PAID",
      entity: "Pagamento",
      entityId: id,
      metadata: { newStatus: "paid" },
    });
    revalidatePath("/pagamentos");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao marcar como pago" };
  }
}

export async function markAsPendingAction(id: string) {
  await requireAdmin();
  try {
    await repo.markAsPending(id, TENANT_ID);
    const user = await getUser();
    await createAuditLog({
      userId: user?.id ?? "unknown",
      userEmail: user?.email,
      action: "MARK_PENDING",
      entity: "Pagamento",
      entityId: id,
      metadata: { newStatus: "pending" },
    });
    revalidatePath("/pagamentos");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao marcar como pendente" };
  }
}

export async function deletePagamentoAction(id: string) {
  await requireAdmin();
  try {
    await repo.deletePagamento(id, TENANT_ID);
    const user = await getUser();
    await createAuditLog({
      userId: user?.id ?? "unknown",
      userEmail: user?.email,
      action: "DELETE",
      entity: "Pagamento",
      entityId: id,
    });
    revalidatePath("/pagamentos");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao eliminar pagamento" };
  }
}

export async function restorePagamentoAction(id: string) {
  await requireAdmin();
  try {
    await repo.restorePagamento(id, TENANT_ID);
    const user = await getUser();
    await createAuditLog({
      userId: user?.id ?? "unknown",
      userEmail: user?.email,
      action: "UPDATE",
      entity: "Pagamento",
      entityId: id,
      metadata: { restored: true },
    });
    revalidatePath("/pagamentos");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao restaurar pagamento" };
  }
}

