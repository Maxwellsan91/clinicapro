"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TENANT_ID } from "@/constants";
import { getUser } from "@/features/auth/actions";
import { createAuditLog } from "@/lib/audit";
import { scheduleAppointmentReminder, scheduleAppointmentCancelledNotification } from "@/server/services/notification-service";
import { createAgendamentoSchema, updateAgendamentoSchema } from "./schema";
import * as repo from "./repository";

// ── Helpers de conflito ───────────────────────────────────────────────────────

async function validateConflicts(
  collaboratorId: string,
  startDateTime: Date,
  endDateTime: Date,
  resourceIds: string[],
  excludeId?: string,
): Promise<{ success: false; error: Record<string, string[]> } | null> {
  try {
    repo.assertValidAppointmentInterval(startDateTime, endDateTime);
  } catch (error) {
    return {
      success: false,
      error: {
        _global: [error instanceof Error ? error.message : "Horário inválido."],
      },
    };
  }

  // 1. Conflito de colaborador
  const collabConflict = await repo.checkCollaboratorConflict({
    tenantId: TENANT_ID,
    collaboratorId,
    startDateTime,
    endDateTime,
    excludeAppointmentId: excludeId,
  });
  if (collabConflict) {
    return {
      success: false,
      error: {
        _global: [
          `O colaborador já tem um agendamento com ${collabConflict.client.name} neste horário.`,
        ],
      },
    };
  }

  // 2. Conflito de recursos
  if (resourceIds.length > 0) {
    const resourceConflicts = await repo.checkResourceConflicts({
      tenantId: TENANT_ID,
      resourceIds,
      startDateTime,
      endDateTime,
      excludeAppointmentId: excludeId,
    });
    if (resourceConflicts.length > 0) {
      const firstConflict = resourceConflicts[0];
      const firstAppointment = firstConflict.appointments[0];
      const specificMessage = firstAppointment
        ? `${firstConflict.resourceName} já está reservada entre ${firstAppointment.timeRange}.`
        : `${firstConflict.resourceName} já está reservada neste horário.`;
      return {
        success: false,
        error: {
          _global: [
            `Não foi possível guardar o agendamento. ${specificMessage}`,
          ],
        },
      };
    }
  }

  return null; // sem conflitos
}

function revalidateOperationalViews(appointmentId?: string) {
  revalidatePath("/agendamentos");
  if (appointmentId) revalidatePath(`/agendamentos/${appointmentId}`);
  revalidatePath("/pagamentos");
  revalidatePath("/financeiro");
  revalidatePath("/financeiro/resumo-anual");
  revalidatePath("/comissoes");
}

// ── Actions ───────────────────────────────────────────────────────────────────

export async function createAgendamentoAction(formData: FormData) {
  const raw = {
    clientId:       formData.get("clientId") as string,
    collaboratorId: formData.get("collaboratorId") as string,
    serviceId:      formData.get("serviceId") as string,
    startDateTime:  formData.get("startDateTime") as string,
    endDateTime:    formData.get("endDateTime") as string,
    status:         formData.get("status") as string,
    notes:          formData.get("notes") as string,
    resourceIds:    formData.getAll("resourceIds").map(String).filter(Boolean),
  };

  const result = createAgendamentoSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  // Validar conflitos
  const conflict = await validateConflicts(
    result.data.collaboratorId,
    new Date(result.data.startDateTime),
    new Date(result.data.endDateTime),
    result.data.resourceIds ?? [],
  );
  if (conflict) return conflict;

  try {
    const agendamento = await repo.createAgendamento(TENANT_ID, result.data);
    await repo.ensurePaymentForFinalizedAppointment(TENANT_ID, agendamento.id);
    const user = await getUser();
    await createAuditLog({
      userId: user?.id ?? "unknown",
      userEmail: user?.email,
      action: "CREATE",
      entity: "Agendamento",
      entityId: agendamento.id,
      metadata: {
        clientId:    result.data.clientId,
        serviceId:   result.data.serviceId,
        resourceIds: result.data.resourceIds,
        startDateTime: result.data.startDateTime,
      },
    });
    // Agendar lembrete 24h antes
    import("@/lib/prisma").then(({ prisma }) =>
      prisma.client.findFirst({ where: { id: agendamento.clientId }, select: { email: true } })
    ).then((c) => {
      if (c?.email) {
        return scheduleAppointmentReminder({
          appointmentId:    agendamento.id,
          clientEmail:      c.email,
          clientName:       agendamento.client.name,
          serviceName:      agendamento.service.name,
          collaboratorName: agendamento.collaborator.name,
          startDateTime:    agendamento.startDateTime,
        });
      }
    }).catch(() => {});
    revalidateOperationalViews(agendamento.id);
  } catch {
    return { success: false, error: { _global: ["Erro ao criar agendamento"] } };
  }

  redirect("/agendamentos");
}

export async function updateAgendamentoAction(id: string, formData: FormData) {
  const raw = {
    clientId:       formData.get("clientId") as string,
    collaboratorId: formData.get("collaboratorId") as string,
    serviceId:      formData.get("serviceId") as string,
    startDateTime:  formData.get("startDateTime") as string,
    endDateTime:    formData.get("endDateTime") as string,
    status:         formData.get("status") as string,
    notes:          formData.get("notes") as string,
    resourceIds:    formData.getAll("resourceIds").map(String).filter(Boolean),
  };

  const result = updateAgendamentoSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }

  // Só valida conflitos se colaborador e datas estiverem presentes
  if (result.data.collaboratorId && result.data.startDateTime && result.data.endDateTime) {
    const conflict = await validateConflicts(
      result.data.collaboratorId,
      new Date(result.data.startDateTime),
      new Date(result.data.endDateTime),
      result.data.resourceIds ?? [],
      id,
    );
    if (conflict) return conflict;
  }

  try {
    await repo.updateAgendamento(id, TENANT_ID, result.data);
    await repo.ensurePaymentForFinalizedAppointment(TENANT_ID, id);
    const user = await getUser();
    await createAuditLog({
      userId: user?.id ?? "unknown",
      userEmail: user?.email,
      action: "UPDATE",
      entity: "Agendamento",
      entityId: id,
      metadata: { status: result.data.status, resourceIds: result.data.resourceIds },
    });
    revalidateOperationalViews(id);
  } catch {
    return { success: false, error: { _global: ["Erro ao atualizar agendamento"] } };
  }

  redirect("/agendamentos");
}

export async function cancelAgendamentoAction(id: string) {
  try {
    await repo.cancelAgendamento(id, TENANT_ID);
    await repo.ensurePaymentForFinalizedAppointment(TENANT_ID, id);
    const user = await getUser();
    await createAuditLog({
      userId: user?.id ?? "unknown",
      userEmail: user?.email,
      action: "CANCEL",
      entity: "Agendamento",
      entityId: id,
    });
    // Enviar email de cancelamento ao cliente
    const full = await import("@/lib/prisma").then(({ prisma }) =>
      prisma.appointment.findFirst({
        where: { id, tenantId: TENANT_ID },
        include: {
          client:  { select: { name: true, email: true } },
          service: { select: { name: true } },
        },
      })
    );
    if (full?.client?.email) {
      await scheduleAppointmentCancelledNotification({
        appointmentId: id,
        clientEmail:   full.client.email,
        clientName:    full.client.name,
        serviceName:   full.service.name,
        startDateTime: full.startDateTime,
      }).catch(() => {});
    }
    revalidateOperationalViews(id);
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao cancelar agendamento" };
  }
}

export async function deleteAgendamentoAction(id: string) {
  try {
    await repo.deleteAgendamento(id, TENANT_ID);
    const user = await getUser();
    await createAuditLog({
      userId: user?.id ?? "unknown",
      userEmail: user?.email,
      action: "DELETE",
      entity: "Agendamento",
      entityId: id,
    });
    revalidatePath("/agendamentos");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao excluir agendamento" };
  }
}

export async function restoreAgendamentoAction(id: string) {
  try {
    await repo.restoreAgendamento(id, TENANT_ID);
    const user = await getUser();
    await createAuditLog({
      userId: user?.id ?? "unknown",
      userEmail: user?.email,
      action: "UPDATE",
      entity: "Agendamento",
      entityId: id,
      metadata: { restored: true },
    });
    revalidatePath("/agendamentos");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao restaurar agendamento" };
  }
}
