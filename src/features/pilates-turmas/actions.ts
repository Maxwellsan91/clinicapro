"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TENANT_ID } from "@/constants";
import { getUser, isAdmin } from "@/features/auth/actions";
import { createAuditLog } from "@/lib/audit";
import {
  createPilatesClassSchema,
  enrollPilatesClassSchema,
  pilatesScheduleSchema,
  updatePilatesClassSchema,
  updatePilatesEnrollmentSchema,
} from "./schema";
import * as repo from "./repository";

async function requireAdmin() {
  if (!(await isAdmin())) {
    throw new Error("Sem permissões para esta operação.");
  }
}

async function audit(action: Parameters<typeof createAuditLog>[0]["action"], entityId: string, metadata?: Record<string, unknown>) {
  const user = await getUser();
  await createAuditLog({
    userId: user?.id ?? "unknown",
    userEmail: user?.email,
    action,
    entity: "TurmaPilates",
    entityId,
    metadata,
  });
}

function parseSchedulesFromFormData(formData: FormData) {
  const schedulesJson = formData.get("schedules") as string | null;
  if (!schedulesJson) return [];
  try {
    return JSON.parse(schedulesJson);
  } catch {
    return [];
  }
}

function parseEnrollmentDaysFromFormData(formData: FormData) {
  const daysJson = formData.get("days") as string | null;
  if (!daysJson) return [];
  try {
    return JSON.parse(daysJson);
  } catch {
    return [];
  }
}

export async function createPilatesClassAction(formData: FormData) {
  await requireAdmin();
  const raw = {
    name: formData.get("name") as string,
    serviceId: formData.get("serviceId") as string,
    collaboratorId: formData.get("collaboratorId") as string,
    resourceId: formData.get("resourceId") as string,
    capacity: formData.get("capacity"),
    isActive: formData.get("isActive") === "true",
    notes: formData.get("notes") as string,
    schedules: parseSchedulesFromFormData(formData),
  };

  const result = createPilatesClassSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  try {
    const pilatesClass = await repo.createPilatesClass(TENANT_ID, result.data);
    await audit("CREATE", pilatesClass.id, { name: pilatesClass.name });
    revalidatePath("/pilates/turmas");
  } catch (error) {
    return { success: false, error: { _global: [error instanceof Error ? error.message : "Erro ao criar turma"] } };
  }

  redirect("/pilates/turmas");
}

export async function updatePilatesClassAction(id: string, formData: FormData) {
  await requireAdmin();
  const raw = {
    name: formData.get("name") as string,
    serviceId: formData.get("serviceId") as string,
    collaboratorId: formData.get("collaboratorId") as string,
    resourceId: formData.get("resourceId") as string,
    capacity: formData.get("capacity"),
    isActive: formData.get("isActive") === "true",
    notes: formData.get("notes") as string,
    schedules: parseSchedulesFromFormData(formData),
  };

  const result = updatePilatesClassSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  try {
    const pilatesClass = await repo.updatePilatesClass(id, TENANT_ID, result.data);
    await audit("UPDATE", id, { name: pilatesClass.name });
    revalidatePath("/pilates/turmas");
    revalidatePath(`/pilates/turmas/${id}`);
  } catch (error) {
    return { success: false, error: { _global: [error instanceof Error ? error.message : "Erro ao atualizar turma"] } };
  }

  redirect(`/pilates/turmas/${id}`);
}

export async function deletePilatesClassAction(id: string) {
  await requireAdmin();
  try {
    await repo.deletePilatesClass(id, TENANT_ID);
    await audit("DELETE", id);
    revalidatePath("/pilates/turmas");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao eliminar turma" };
  }
}

export async function togglePilatesClassStatusAction(id: string, isActive: boolean) {
  await requireAdmin();
  try {
    await repo.togglePilatesClassStatus(id, TENANT_ID, isActive);
    await audit("STATUS_CHANGE", id, { isActive });
    revalidatePath("/pilates/turmas");
    revalidatePath(`/pilates/turmas/${id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao alterar estado" };
  }
}

export async function addPilatesClassScheduleAction(classId: string, formData: FormData) {
  await requireAdmin();
  const result = pilatesScheduleSchema.safeParse({
    dayOfWeek: formData.get("dayOfWeek"),
    startTime: formData.get("startTime"),
    duration: formData.get("duration"),
  });
  if (!result.success) return { success: false, error: result.error.flatten().fieldErrors };

  try {
    const schedule = await repo.addPilatesClassSchedule(classId, TENANT_ID, result.data);
    await audit("UPDATE", classId, { scheduleAdded: schedule.id });
    revalidatePath(`/pilates/turmas/${classId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao adicionar horário" };
  }
}

export async function removePilatesClassScheduleAction(classId: string, scheduleId: string) {
  await requireAdmin();
  try {
    await repo.removePilatesClassSchedule(scheduleId, TENANT_ID);
    await audit("UPDATE", classId, { scheduleRemoved: scheduleId });
    revalidatePath(`/pilates/turmas/${classId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao remover horário" };
  }
}

export async function enrollClientInPilatesClassAction(classId: string, formData: FormData) {
  await requireAdmin();
  const raw = {
    classId,
    clientId: formData.get("clientId") as string,
    frequency: formData.get("frequency") as string,
    status: formData.get("status") as string,
    startDate: formData.get("startDate") as string,
    notes: formData.get("notes") as string,
    days: parseEnrollmentDaysFromFormData(formData),
  };
  const result = enrollPilatesClassSchema.safeParse(raw);
  if (!result.success) return { success: false, error: result.error.flatten().fieldErrors };

  try {
    const enrollment = await repo.enrollClient(TENANT_ID, result.data);
    await audit("CREATE", classId, { enrollmentId: enrollment.id, clientId: enrollment.clientId });
    revalidatePath(`/pilates/turmas/${classId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: { _global: [error instanceof Error ? error.message : "Erro ao inscrever aluno"] } };
  }
}

export async function updatePilatesClassEnrollmentAction(enrollmentId: string, classId: string, formData: FormData) {
  await requireAdmin();
  const raw = {
    clientId: formData.get("clientId") as string,
    frequency: formData.get("frequency") as string,
    status: formData.get("status") as string,
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
    notes: formData.get("notes") as string,
    days: parseEnrollmentDaysFromFormData(formData),
  };
  const result = updatePilatesEnrollmentSchema.safeParse(raw);
  if (!result.success) return { success: false, error: result.error.flatten().fieldErrors };

  try {
    await repo.updatePilatesClassEnrollment(enrollmentId, TENANT_ID, result.data);
    await audit("UPDATE", classId, { enrollmentId });
    revalidatePath(`/pilates/turmas/${classId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: { _global: [error instanceof Error ? error.message : "Erro ao atualizar inscrição"] } };
  }
}

export async function removeClientFromPilatesClassAction(enrollmentId: string, classId: string) {
  await requireAdmin();
  try {
    await repo.removeEnrollment(enrollmentId, TENANT_ID);
    await audit("CANCEL", classId, { enrollmentId });
    revalidatePath(`/pilates/turmas/${classId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao remover aluno" };
  }
}

export async function pausePilatesClassEnrollmentAction(enrollmentId: string, classId: string) {
  await requireAdmin();
  try {
    await repo.pauseEnrollment(enrollmentId, TENANT_ID);
    await audit("PAUSE", classId, { enrollmentId });
    revalidatePath(`/pilates/turmas/${classId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao pausar inscrição" };
  }
}

export async function reactivatePilatesClassEnrollmentAction(enrollmentId: string, classId: string) {
  await requireAdmin();
  try {
    await repo.reactivateEnrollment(enrollmentId, TENANT_ID);
    await audit("REACTIVATE", classId, { enrollmentId });
    revalidatePath(`/pilates/turmas/${classId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erro ao reativar inscrição" };
  }
}
