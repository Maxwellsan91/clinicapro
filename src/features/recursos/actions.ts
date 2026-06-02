"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TENANT_ID } from "@/constants";
import { getUser } from "@/features/auth/actions";
import { createAuditLog } from "@/lib/audit";
import { createRecursoSchema, updateRecursoSchema } from "./schema";
import * as repo from "./repository";

export async function createRecursoAction(formData: FormData) {
  const raw = {
    name:     formData.get("name") as string,
    type:     formData.get("type") as string,
    capacity: formData.get("capacity"),
    isActive: formData.get("isActive") === "true",
  };

  const result = createRecursoSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  try {
    const recurso = await repo.createRecurso(TENANT_ID, result.data);
    const user = await getUser();
    await createAuditLog({
      userId: user?.id ?? "unknown",
      userEmail: user?.email,
      action: "CREATE",
      entity: "Servico", // reutiliza categoria existente no AuditLog
      entityId: recurso.id,
      metadata: { name: result.data.name, type: result.data.type },
    });
    revalidatePath("/recursos");
  } catch {
    return { success: false, error: { _global: ["Erro ao criar recurso"] } };
  }

  redirect("/recursos");
}

export async function updateRecursoAction(id: string, formData: FormData) {
  const raw = {
    name:     formData.get("name") as string,
    type:     formData.get("type") as string,
    capacity: formData.get("capacity"),
    isActive: formData.get("isActive") === "true",
  };

  const result = updateRecursoSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  try {
    await repo.updateRecurso(id, TENANT_ID, result.data);
    const user = await getUser();
    await createAuditLog({
      userId: user?.id ?? "unknown",
      userEmail: user?.email,
      action: "UPDATE",
      entity: "Servico",
      entityId: id,
      metadata: { name: result.data.name },
    });
    revalidatePath("/recursos");
  } catch {
    return { success: false, error: { _global: ["Erro ao atualizar recurso"] } };
  }

  redirect("/recursos");
}

export async function deleteRecursoAction(id: string) {
  try {
    await repo.deleteRecurso(id, TENANT_ID);
    const user = await getUser();
    await createAuditLog({
      userId: user?.id ?? "unknown",
      userEmail: user?.email,
      action: "DELETE",
      entity: "Servico",
      entityId: id,
    });
    revalidatePath("/recursos");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao eliminar recurso" };
  }
}

export async function restoreRecursoAction(id: string) {
  try {
    await repo.restoreRecurso(id, TENANT_ID);
    const user = await getUser();
    await createAuditLog({
      userId: user?.id ?? "unknown",
      userEmail: user?.email,
      action: "UPDATE",
      entity: "Servico",
      entityId: id,
      metadata: { restored: true },
    });
    revalidatePath("/recursos");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao restaurar recurso" };
  }
}

