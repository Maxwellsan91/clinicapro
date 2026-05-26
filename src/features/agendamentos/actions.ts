"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TENANT_ID } from "@/constants";
import { createAgendamentoSchema, updateAgendamentoSchema } from "./schema";
import * as repo from "./repository";

export async function createAgendamentoAction(formData: FormData) {
  const raw = {
    clientId: formData.get("clientId") as string,
    collaboratorId: formData.get("collaboratorId") as string,
    serviceId: formData.get("serviceId") as string,
    startDateTime: formData.get("startDateTime") as string,
    endDateTime: formData.get("endDateTime") as string,
    status: formData.get("status") as string,
    notes: formData.get("notes") as string,
  };

  const result = createAgendamentoSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  try {
    await repo.createAgendamento(TENANT_ID, result.data);
    revalidatePath("/agendamentos");
  } catch {
    return { success: false, error: { _global: ["Erro ao criar agendamento"] } };
  }

  redirect("/agendamentos");
}

export async function updateAgendamentoAction(id: string, formData: FormData) {
  const raw = {
    clientId: formData.get("clientId") as string,
    collaboratorId: formData.get("collaboratorId") as string,
    serviceId: formData.get("serviceId") as string,
    startDateTime: formData.get("startDateTime") as string,
    endDateTime: formData.get("endDateTime") as string,
    status: formData.get("status") as string,
    notes: formData.get("notes") as string,
  };

  const result = updateAgendamentoSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  try {
    await repo.updateAgendamento(id, TENANT_ID, result.data);
    revalidatePath("/agendamentos");
    revalidatePath(`/agendamentos/${id}`);
  } catch {
    return { success: false, error: { _global: ["Erro ao atualizar agendamento"] } };
  }

  redirect("/agendamentos");
}

export async function cancelAgendamentoAction(id: string) {
  try {
    await repo.cancelAgendamento(id, TENANT_ID);
    revalidatePath("/agendamentos");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao cancelar agendamento" };
  }
}

export async function deleteAgendamentoAction(id: string) {
  try {
    await repo.deleteAgendamento(id, TENANT_ID);
    revalidatePath("/agendamentos");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao excluir agendamento" };
  }
}

