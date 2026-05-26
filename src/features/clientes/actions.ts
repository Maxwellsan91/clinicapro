"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TENANT_ID } from "@/constants";
import { createClienteSchema, updateClienteSchema } from "./schema";
import * as repo from "./repository";

export async function createClienteAction(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    birthDate: formData.get("birthDate") as string,
    cpf: formData.get("cpf") as string,
    address: formData.get("address") as string,
    notes: formData.get("notes") as string,
  };

  const result = createClienteSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  try {
    await repo.createCliente(TENANT_ID, result.data);
    revalidatePath("/clientes");
  } catch {
    return { success: false, error: { _global: ["Erro ao criar cliente"] } };
  }

  redirect("/clientes");
}

export async function updateClienteAction(id: string, formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    birthDate: formData.get("birthDate") as string,
    cpf: formData.get("cpf") as string,
    address: formData.get("address") as string,
    notes: formData.get("notes") as string,
  };

  const result = updateClienteSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  try {
    await repo.updateCliente(id, TENANT_ID, result.data);
    revalidatePath("/clientes");
    revalidatePath(`/clientes/${id}`);
  } catch {
    return { success: false, error: { _global: ["Erro ao atualizar cliente"] } };
  }

  redirect("/clientes");
}

export async function deleteClienteAction(id: string) {
  try {
    await repo.deleteCliente(id, TENANT_ID);
    revalidatePath("/clientes");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao excluir cliente" };
  }
}

