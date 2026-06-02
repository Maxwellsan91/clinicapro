"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TENANT_ID } from "@/constants";
import { getUser } from "@/features/auth/actions";
import { createAuditLog } from "@/lib/audit";
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
    const cliente = await repo.createCliente(TENANT_ID, result.data);
    const user = await getUser();
    await createAuditLog({
      userId: user?.id ?? "unknown",
      userEmail: user?.email,
      action: "CREATE",
      entity: "Cliente",
      entityId: cliente.id,
      metadata: { name: result.data.name },
    });
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
    const user = await getUser();
    await createAuditLog({
      userId: user?.id ?? "unknown",
      userEmail: user?.email,
      action: "UPDATE",
      entity: "Cliente",
      entityId: id,
      metadata: { name: result.data.name },
    });
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
    const user = await getUser();
    await createAuditLog({
      userId: user?.id ?? "unknown",
      userEmail: user?.email,
      action: "DELETE",
      entity: "Cliente",
      entityId: id,
    });
    revalidatePath("/clientes");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao excluir cliente" };
  }
}

export async function updateClienteNotesAction(id: string, notes: string) {
  try {
    await repo.updateCliente(id, TENANT_ID, { notes });
    const user = await getUser();
    await createAuditLog({
      userId: user?.id ?? "unknown",
      userEmail: user?.email,
      action: "UPDATE",
      entity: "Cliente",
      entityId: id,
      metadata: { field: "notes" },
    });
    revalidatePath(`/clientes/${id}`);
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar observações" };
  }
}

export async function restoreClienteAction(id: string) {
  try {
    await repo.restoreCliente(id, TENANT_ID);
    const user = await getUser();
    await createAuditLog({
      userId: user?.id ?? "unknown",
      userEmail: user?.email,
      action: "UPDATE",
      entity: "Cliente",
      entityId: id,
      metadata: { restored: true },
    });
    revalidatePath("/clientes");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao restaurar cliente" };
  }
}

