/**
 * Notification Service — ClinicaPro
 *
 * Responsável por:
 * - Criar notificações na BD
 * - Enviar emails via Resend
 * - Processar fila de notificações pendentes (chamado pelo cron)
 */

import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { TENANT_ID } from "@/constants";
import {
  appointmentReminderTemplate,
  appointmentCancelledTemplate,
  paymentPendingTemplate,
} from "@/server/email-templates";

// ── Tipos ─────────────────────────────────────────────────────────────────

export type NotificationType =
  | "appointment_reminder"
  | "payment_pending"
  | "appointment_cancelled";

export type NotificationStatus = "pending" | "sent" | "failed" | "cancelled";

export interface CreateNotificationInput {
  type: NotificationType;
  recipient: string;
  title: string;
  message: string;
  appointmentId?: string;
}

export interface ProcessResult {
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
}

// ── Resend client (lazy — só instancia se API key existir) ────────────────

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY não configurada.");
  return new Resend(apiKey);
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "notificacoes@clinicapro.pt";
const CLINIC_NAME = process.env.CLINIC_NAME ?? "ClinicaPro";

// ── Criar notificação na BD ───────────────────────────────────────────────

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      tenantId: TENANT_ID,
      type: input.type,
      recipient: input.recipient,
      title: input.title,
      message: input.message,
      status: "pending",
      appointmentId: input.appointmentId ?? null,
    },
  });
}

// ── Notificação de cancelamento (imediata) ───────────────────────────────

export async function scheduleAppointmentCancelledNotification(params: {
  appointmentId: string;
  clientEmail: string;
  clientName: string;
  serviceName: string;
  startDateTime: Date;
  reason?: string;
}) {
  const { subject, html } = appointmentCancelledTemplate({
    clientName: params.clientName,
    serviceName: params.serviceName,
    startDateTime: params.startDateTime,
    clinicName: CLINIC_NAME,
    reason: params.reason,
  });

  const notification = await createNotification({
    type: "appointment_cancelled",
    recipient: params.clientEmail,
    title: subject,
    message: `Agendamento cancelado: ${params.serviceName} em ${params.startDateTime.toLocaleDateString("pt-PT")}`,
    appointmentId: params.appointmentId,
  });

  // Enviar imediatamente
  await sendNotificationEmail(notification.id, params.clientEmail, subject, html);
}

// ── Agendar lembrete 24h antes ────────────────────────────────────────────

export async function scheduleAppointmentReminder(params: {
  appointmentId: string;
  clientEmail: string;
  clientName: string;
  serviceName: string;
  collaboratorName: string;
  startDateTime: Date;
}) {
  // Evitar duplicados
  const existing = await prisma.notification.findFirst({
    where: {
      tenantId: TENANT_ID,
      appointmentId: params.appointmentId,
      type: "appointment_reminder",
      status: { in: ["pending", "sent"] },
    },
  });
  if (existing) return existing;

  return createNotification({
    type: "appointment_reminder",
    recipient: params.clientEmail,
    title: `Lembrete: Consulta amanhã — ${params.serviceName}`,
    message: `Lembrete de consulta: ${params.serviceName} com ${params.collaboratorName} em ${params.startDateTime.toLocaleDateString("pt-PT")}`,
    appointmentId: params.appointmentId,
  });
}

// ── Agendar notificação de pagamento pendente ─────────────────────────────

export async function schedulePaymentPendingNotification(params: {
  clientEmail: string;
  clientName: string;
  amount: number;
  dueDate: Date;
}) {
  const { subject, html } = paymentPendingTemplate({
    clientName: params.clientName,
    amount: params.amount,
    dueDate: params.dueDate,
    clinicName: CLINIC_NAME,
  });

  const notification = await createNotification({
    type: "payment_pending",
    recipient: params.clientEmail,
    title: subject,
    message: `Pagamento pendente de ${params.amount}€ com vencimento em ${params.dueDate.toLocaleDateString("pt-PT")}`,
  });

  await sendNotificationEmail(notification.id, params.clientEmail, subject, html);
}

// ── Enviar email via Resend ───────────────────────────────────────────────

async function sendNotificationEmail(
  notificationId: string,
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: "failed", errorMessage: error.message, sentAt: new Date() },
      });
      console.error(`[Notification] Falha ao enviar ${notificationId}:`, error.message);
      return false;
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: "sent", sentAt: new Date(), errorMessage: null },
    });
    return true;

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: "failed", errorMessage: message, sentAt: new Date() },
    });
    console.error(`[Notification] Erro inesperado ${notificationId}:`, message);
    return false;
  }
}

// ── Processador de fila (chamado pelo cron) ───────────────────────────────

export async function processNotificationQueue(): Promise<ProcessResult> {
  const result: ProcessResult = { processed: 0, sent: 0, failed: 0, skipped: 0 };

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  // 1. Buscar lembretes pendentes cujo agendamento é nas próximas 24–25h
  const pendingReminders = await prisma.notification.findMany({
    where: {
      tenantId: TENANT_ID,
      type: "appointment_reminder",
      status: "pending",
      appointmentId: { not: null },
    },
    take: 50,
  });

  for (const notif of pendingReminders) {
    result.processed++;

    // Verificar se o agendamento é nas próximas 24-25h
    if (!notif.appointmentId) { result.skipped++; continue; }

    const apt = await prisma.appointment.findFirst({
      where: {
        id: notif.appointmentId,
        tenantId: TENANT_ID,
        isDeleted: false,
        status: { notIn: ["cancelled"] },
      },
      include: {
        client:       { select: { name: true, email: true } },
        collaborator: { select: { name: true } },
        service:      { select: { name: true } },
      },
    });

    if (!apt) { result.skipped++; continue; }
    if (!apt.client.email) { result.skipped++; continue; }

    // Só enviar se o agendamento for nas próximas 24-25h
    const isInWindow = apt.startDateTime >= in24h && apt.startDateTime <= in25h;
    if (!isInWindow) { result.skipped++; continue; }

    const { subject, html } = appointmentReminderTemplate({
      clientName:       apt.client.name,
      serviceName:      apt.service.name,
      collaboratorName: apt.collaborator.name,
      startDateTime:    apt.startDateTime,
      clinicName:       CLINIC_NAME,
    });

    const ok = await sendNotificationEmail(notif.id, apt.client.email, subject, html);
    if (ok) result.sent++; else result.failed++;
  }

  // 2. Criar lembretes para agendamentos nas próximas 24-25h que ainda não têm notificação
  const appointmentsToRemind = await prisma.appointment.findMany({
    where: {
      tenantId: TENANT_ID,
      isDeleted: false,
      status: { notIn: ["cancelled", "completed"] },
      startDateTime: { gte: in24h, lte: in25h },
    },
    include: {
      client:       { select: { id: true, name: true, email: true } },
      collaborator: { select: { id: true, name: true } },
      service:      { select: { id: true, name: true } },
    },
  });

  for (const apt of appointmentsToRemind) {
    if (!apt.client.email) continue;

    // Verificar se já existe notificação
    const existing = await prisma.notification.findFirst({
      where: {
        tenantId: TENANT_ID,
        appointmentId: apt.id,
        type: "appointment_reminder",
        status: { in: ["pending", "sent"] },
      },
    });
    if (existing) continue;

    result.processed++;

    const { subject, html } = appointmentReminderTemplate({
      clientName:       apt.client.name,
      serviceName:      apt.service.name,
      collaboratorName: apt.collaborator.name,
      startDateTime:    apt.startDateTime,
      clinicName:       CLINIC_NAME,
    });

    const notif = await createNotification({
      type: "appointment_reminder",
      recipient: apt.client.email,
      title: subject,
      message: `Lembrete de consulta: ${apt.service.name}`,
      appointmentId: apt.id,
    });

    const ok = await sendNotificationEmail(notif.id, apt.client.email, subject, html);
    if (ok) result.sent++; else result.failed++;
  }

  console.log(`[Notification Cron] processed=${result.processed} sent=${result.sent} failed=${result.failed} skipped=${result.skipped}`);
  return result;
}

// ── Queries de listagem (para UI de administração) ────────────────────────

export async function getNotifications(filters: {
  status?: NotificationStatus;
  type?: NotificationType;
  page?: number;
}) {
  const page = filters.page ?? 1;
  const take = 50;
  const skip = (page - 1) * take;

  const where = {
    tenantId: TENANT_ID,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.type   ? { type:   filters.type   } : {}),
  };

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.notification.count({ where }),
  ]);

  return { notifications, total, page, pageSize: take };
}

