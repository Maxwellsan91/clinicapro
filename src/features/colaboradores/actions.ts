"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TENANT_ID } from "@/constants";
import { isAdmin, getUser } from "@/features/auth/actions";
import { createAuditLog } from "@/lib/audit";
import { createColaboradorSchema, updateColaboradorSchema } from "./schema";
import * as repo from "./repository";

export async function createColaboradorAction(formData: FormData) {
  if (!(await isAdmin())) {
    return { success: false, error: { _global: ["Sem permissão"] } };
  }

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    role: formData.get("role") as string,
    specialty: formData.get("specialty") as string,
    commissionRate: formData.get("commissionRate"),
  };

  const result = createColaboradorSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  try {
    const colaborador = await repo.createColaborador(TENANT_ID, result.data);
    const user = await getUser();
    await createAuditLog({
      userId: user?.id ?? "unknown",
      userEmail: user?.email,
      action: "CREATE",
      entity: "Colaborador",
      entityId: colaborador.id,
      metadata: { name: result.data.name, role: result.data.role },
    });
    revalidatePath("/colaboradores");
  } catch {
    return { success: false, error: { _global: ["Erro ao criar colaborador"] } };
  }

  redirect("/colaboradores");
}

export async function updateColaboradorAction(id: string, formData: FormData) {
  if (!(await isAdmin())) {
    return { success: false, error: { _global: ["Sem permissão"] } };
  }

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    role: formData.get("role") as string,
    specialty: formData.get("specialty") as string,
    commissionRate: formData.get("commissionRate"),
  };

  const result = updateColaboradorSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  try {
    await repo.updateColaborador(id, TENANT_ID, result.data);
    const user = await getUser();
    await createAuditLog({
      userId: user?.id ?? "unknown",
      userEmail: user?.email,
      action: "UPDATE",
      entity: "Colaborador",
      entityId: id,
      metadata: { name: result.data.name },
    });
    revalidatePath("/colaboradores");
  } catch {
    return { success: false, error: { _global: ["Erro ao atualizar colaborador"] } };
  }

  redirect("/colaboradores");
}

export async function deleteColaboradorAction(id: string) {
  if (!(await isAdmin())) {
    return { success: false, error: "Sem permissão" };
  }
  try {
    await repo.deleteColaborador(id, TENANT_ID);
    const user = await getUser();
    await createAuditLog({
      userId: user?.id ?? "unknown",
      userEmail: user?.email,
      action: "DELETE",
      entity: "Colaborador",
      entityId: id,
    });
    revalidatePath("/colaboradores");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao excluir colaborador" };
  }
}

export async function restoreColaboradorAction(id: string) {
  if (!(await isAdmin())) {
    return { success: false, error: "Sem permissão" };
  }
  try {
    await repo.restoreColaborador(id, TENANT_ID);
    const user = await getUser();
    await createAuditLog({
      userId: user?.id ?? "unknown",
      userEmail: user?.email,
      action: "UPDATE",
      entity: "Colaborador",
      entityId: id,
      metadata: { restored: true },
    });
    revalidatePath("/colaboradores");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao restaurar colaborador" };
  }
}

export async function updateCommissionRateAction(id: string, commissionRate: number) {
  if (!(await isAdmin())) {
    return { success: false, error: "Sem permissão" };
  }
  try {
    await repo.updateColaborador(id, TENANT_ID, { commissionRate });
    const user = await getUser();
    await createAuditLog({
      userId: user?.id ?? "unknown",
      userEmail: user?.email,
      action: "UPDATE",
      entity: "Colaborador",
      entityId: id,
      metadata: { field: "commissionRate", newValue: commissionRate },
    });
    revalidatePath("/colaboradores");
    revalidatePath("/comissoes");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar comissão" };
  }
}
