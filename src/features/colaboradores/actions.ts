"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TENANT_ID } from "@/constants";
import { createColaboradorSchema, updateColaboradorSchema } from "./schema";
import * as repo from "./repository";

export async function createColaboradorAction(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    role: formData.get("role") as string,
    specialty: formData.get("specialty") as string,
  };

  const result = createColaboradorSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  try {
    await repo.createColaborador(TENANT_ID, result.data);
    revalidatePath("/colaboradores");
  } catch {
    return { success: false, error: { _global: ["Erro ao criar colaborador"] } };
  }

  redirect("/colaboradores");
}

export async function updateColaboradorAction(id: string, formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    role: formData.get("role") as string,
    specialty: formData.get("specialty") as string,
  };

  const result = updateColaboradorSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  try {
    await repo.updateColaborador(id, TENANT_ID, result.data);
    revalidatePath("/colaboradores");
  } catch {
    return { success: false, error: { _global: ["Erro ao atualizar colaborador"] } };
  }

  redirect("/colaboradores");
}

export async function deleteColaboradorAction(id: string) {
  try {
    await repo.deleteColaborador(id, TENANT_ID);
    revalidatePath("/colaboradores");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao excluir colaborador" };
  }
}

