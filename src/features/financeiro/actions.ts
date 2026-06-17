"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TENANT_ID } from "@/constants";
import { getUser, isAdmin } from "@/features/auth/actions";
import { createAuditLog } from "@/lib/audit";
import {
  financialCategorySchema,
  financialEntrySchema,
  monthYearSchema,
  saveMonthSchema,
} from "./schema";
import * as repo from "./repository";

async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Error("Sem permissão");
  }
}

async function audit(
  action: Parameters<typeof createAuditLog>[0]["action"],
  entity: Parameters<typeof createAuditLog>[0]["entity"],
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  const user = await getUser();
  await createAuditLog({
    userId: user?.id ?? "unknown",
    userEmail: user?.email,
    action,
    entity,
    entityId,
    metadata,
  });
}

function parseCategoryForm(formData: FormData) {
  return financialCategorySchema.safeParse({
    name: formData.get("name"),
    group: formData.get("group"),
    type: formData.get("type"),
    defaultValue: formData.get("defaultValue"),
    order: formData.get("order"),
    isActive: formData.get("isActive"),
  });
}

export async function createFinancialCategoryAction(formData: FormData) {
  await requireAdmin();
  const result = parseCategoryForm(formData);
  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  try {
    const category = await repo.createFinancialCategory(TENANT_ID, result.data);
    await audit("CREATE", "CategoriaFinanceira", category.id, { name: category.name });
    revalidatePath("/financeiro");
    revalidatePath("/financeiro/categorias");
  } catch {
    return { success: false, error: { _global: ["Erro ao criar categoria"] } };
  }

  redirect("/financeiro/categorias");
}

export async function updateFinancialCategoryAction(id: string, formData: FormData) {
  await requireAdmin();
  const result = parseCategoryForm(formData);
  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  try {
    await repo.updateFinancialCategory(id, TENANT_ID, result.data);
    await audit("UPDATE", "CategoriaFinanceira", id, { name: result.data.name });
    revalidatePath("/financeiro");
    revalidatePath("/financeiro/categorias");
  } catch {
    return { success: false, error: { _global: ["Erro ao actualizar categoria"] } };
  }

  redirect("/financeiro/categorias");
}

export async function deleteFinancialCategoryAction(id: string) {
  await requireAdmin();
  try {
    await repo.deleteFinancialCategory(id, TENANT_ID);
    await audit("DELETE", "CategoriaFinanceira", id);
    revalidatePath("/financeiro");
    revalidatePath("/financeiro/categorias");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao eliminar categoria" };
  }
}

export async function restoreFinancialCategoryAction(id: string) {
  await requireAdmin();
  try {
    await repo.restoreFinancialCategory(id, TENANT_ID);
    await audit("UPDATE", "CategoriaFinanceira", id, { restored: true });
    revalidatePath("/financeiro");
    revalidatePath("/financeiro/categorias");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao restaurar categoria" };
  }
}

export async function saveFinancialMonthAction(formData: FormData) {
  await requireAdmin();
  const entriesRaw = formData.get("entries");
  let entries: unknown = [];
  try {
    entries = entriesRaw ? JSON.parse(String(entriesRaw)) : [];
  } catch {
    return { success: false, error: "Linhas inválidas" };
  }

  const result = saveMonthSchema.safeParse({
    year: formData.get("year"),
    month: formData.get("month"),
    manualRevenueAdjustment: formData.get("manualRevenueAdjustment"),
    savingsAmount: formData.get("savingsAmount"),
    notes: formData.get("notes"),
    entries,
  });

  if (!result.success) {
    return { success: false, error: "Dados inválidos" };
  }

  try {
    await repo.saveFinancialMonth(TENANT_ID, result.data);
    await audit("UPDATE", "ResumoFinanceiro", undefined, {
      year: result.data.year,
      month: result.data.month,
      entries: result.data.entries.length,
    });
    revalidatePath("/financeiro");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao guardar plano mensal" };
  }
}

export async function generateFinancialMonthAction(formData: FormData) {
  await requireAdmin();
  const result = monthYearSchema.safeParse({
    year: formData.get("year"),
    month: formData.get("month"),
  });
  if (!result.success) return { success: false, error: "Período inválido" };

  try {
    await repo.generateFinancialMonth(TENANT_ID, result.data.year, result.data.month);
    await audit("GENERATE_MONTH", "LancamentoFinanceiro", undefined, result.data);
    revalidatePath("/financeiro");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao gerar mês" };
  }
}

export async function copyPreviousFinancialMonthAction(formData: FormData) {
  await requireAdmin();
  const result = monthYearSchema.safeParse({
    year: formData.get("year"),
    month: formData.get("month"),
  });
  if (!result.success) return { success: false, error: "Período inválido" };

  try {
    await repo.copyPreviousFinancialMonth(TENANT_ID, result.data.year, result.data.month);
    await audit("COPY_MONTH", "LancamentoFinanceiro", undefined, result.data);
    revalidatePath("/financeiro");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao copiar mês anterior" };
  }
}

export async function createFinancialEntryAction(formData: FormData) {
  await requireAdmin();
  const result = financialEntrySchema.safeParse({
    date: formData.get("date"),
    categoryId: formData.get("categoryId"),
    value: formData.get("value"),
    description: formData.get("description"),
    notes: formData.get("notes"),
  });

  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  try {
    const entry = await repo.addAdHocFinancialEntry(TENANT_ID, result.data);
    await audit("CREATE", "LancamentoFinanceiro", entry.id, {
      categoryId: result.data.categoryId,
      value: result.data.value,
      date: result.data.date,
    });
    revalidatePath("/financeiro");
    revalidatePath("/financeiro/lancamentos");
  } catch {
    return { success: false, error: { _global: ["Erro ao criar lançamento"] } };
  }

  redirect("/financeiro");
}
