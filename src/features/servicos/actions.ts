"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TENANT_ID } from "@/constants";
import { createServicoSchema, updateServicoSchema } from "./schema";
import * as repo from "./repository";

export async function createServicoAction(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    duration: formData.get("duration"),
    price: formData.get("price"),
    category: formData.get("category") as string,
    isActive: formData.get("isActive") === "true",
  };

  const result = createServicoSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  try {
    await repo.createServico(TENANT_ID, result.data);
    revalidatePath("/servicos");
  } catch {
    return { success: false, error: { _global: ["Erro ao criar serviço"] } };
  }

  redirect("/servicos");
}

export async function updateServicoAction(id: string, formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    duration: formData.get("duration"),
    price: formData.get("price"),
    category: formData.get("category") as string,
    isActive: formData.get("isActive") === "true",
  };

  const result = updateServicoSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  try {
    await repo.updateServico(id, TENANT_ID, result.data);
    revalidatePath("/servicos");
  } catch {
    return { success: false, error: { _global: ["Erro ao atualizar serviço"] } };
  }

  redirect("/servicos");
}

export async function deleteServicoAction(id: string) {
  try {
    await repo.deleteServico(id, TENANT_ID);
    revalidatePath("/servicos");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao excluir serviço" };
  }
}

