interface AppointmentReminderData {
  clientName: string;
  serviceName: string;
  collaboratorName: string;
  startDateTime: Date;
  clinicName: string;
}

interface AppointmentCancelledData {
  clientName: string;
  serviceName: string;
  startDateTime: Date;
  clinicName: string;
  reason?: string;
}

interface PaymentPendingData {
  clientName: string;
  amount: number;
  dueDate: Date;
  clinicName: string;
}

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background: #f8fafc;
  margin: 0; padding: 0;
`;

const cardStyle = `
  max-width: 560px;
  margin: 32px auto;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
`;

function formatDt(date: Date): string {
  return new Intl.DateTimeFormat("pt-PT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(date);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(amount);
}

export function appointmentReminderTemplate(data: AppointmentReminderData): { subject: string; html: string } {
  const subject = `Lembrete: Consulta amanhã — ${data.serviceName}`;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="${baseStyle}">
  <div style="${cardStyle}">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); padding: 32px 32px 24px;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;background:rgba(255,255,255,0.2);border-radius:10px;margin-bottom:16px;">
        <span style="font-size:20px;">📅</span>
      </div>
      <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 4px;">Lembrete de Consulta</h1>
      <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;">${data.clinicName}</p>
    </div>

    <!-- Body -->
    <div style="padding: 32px;">
      <p style="font-size:16px;color:#1e293b;margin:0 0 24px;">
        Olá, <strong>${data.clientName}</strong>! 👋
      </p>
      <p style="font-size:15px;color:#475569;margin:0 0 24px;line-height:1.6;">
        Este é um lembrete de que tem uma consulta marcada para <strong>amanhã</strong>.
      </p>

      <!-- Info Card -->
      <div style="background:#f1f5f9;border-radius:12px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:13px;width:40%;">🩺 Serviço</td>
            <td style="padding:8px 0;color:#1e293b;font-size:14px;font-weight:600;">${data.serviceName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:13px;">👤 Profissional</td>
            <td style="padding:8px 0;color:#1e293b;font-size:14px;font-weight:600;">${data.collaboratorName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:13px;">🗓️ Data/Hora</td>
            <td style="padding:8px 0;color:#1e293b;font-size:14px;font-weight:600;">${formatDt(data.startDateTime)}</td>
          </tr>
        </table>
      </div>

      <p style="font-size:13px;color:#94a3b8;line-height:1.6;margin:0;">
        Se precisar reagendar ou cancelar, contacte-nos com antecedência.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="font-size:12px;color:#94a3b8;margin:0;">${data.clinicName} · Enviado automaticamente</p>
    </div>
  </div>
</body>
</html>`;
  return { subject, html };
}

export function appointmentCancelledTemplate(data: AppointmentCancelledData): { subject: string; html: string } {
  const subject = `Agendamento cancelado — ${data.serviceName}`;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="${baseStyle}">
  <div style="${cardStyle}">
    <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 32px 32px 24px;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;background:rgba(255,255,255,0.2);border-radius:10px;margin-bottom:16px;">
        <span style="font-size:20px;">❌</span>
      </div>
      <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 4px;">Agendamento Cancelado</h1>
      <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;">${data.clinicName}</p>
    </div>

    <div style="padding: 32px;">
      <p style="font-size:16px;color:#1e293b;margin:0 0 24px;">
        Olá, <strong>${data.clientName}</strong>.
      </p>
      <p style="font-size:15px;color:#475569;margin:0 0 24px;line-height:1.6;">
        O seu agendamento foi <strong>cancelado</strong>. Lamentamos o inconveniente.
      </p>

      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#ef4444;font-size:13px;width:40%;">🩺 Serviço</td>
            <td style="padding:8px 0;color:#7f1d1d;font-size:14px;font-weight:600;">${data.serviceName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#ef4444;font-size:13px;">📅 Data prevista</td>
            <td style="padding:8px 0;color:#7f1d1d;font-size:14px;font-weight:600;">${formatDt(data.startDateTime)}</td>
          </tr>
          ${data.reason ? `<tr>
            <td style="padding:8px 0;color:#ef4444;font-size:13px;">💬 Motivo</td>
            <td style="padding:8px 0;color:#7f1d1d;font-size:14px;">${data.reason}</td>
          </tr>` : ""}
        </table>
      </div>

      <p style="font-size:14px;color:#475569;line-height:1.6;margin:0;">
        Para marcar uma nova consulta, entre em contacto connosco.
      </p>
    </div>

    <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="font-size:12px;color:#94a3b8;margin:0;">${data.clinicName} · Enviado automaticamente</p>
    </div>
  </div>
</body>
</html>`;
  return { subject, html };
}

export function paymentPendingTemplate(data: PaymentPendingData): { subject: string; html: string } {
  const subject = `Pagamento pendente — ${formatCurrency(data.amount)}`;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="${baseStyle}">
  <div style="${cardStyle}">
    <div style="background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); padding: 32px 32px 24px;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;background:rgba(255,255,255,0.2);border-radius:10px;margin-bottom:16px;">
        <span style="font-size:20px;">💳</span>
      </div>
      <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 4px;">Pagamento Pendente</h1>
      <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;">${data.clinicName}</p>
    </div>

    <div style="padding: 32px;">
      <p style="font-size:16px;color:#1e293b;margin:0 0 24px;">
        Olá, <strong>${data.clientName}</strong>.
      </p>
      <p style="font-size:15px;color:#475569;margin:0 0 24px;line-height:1.6;">
        Tem um pagamento pendente na nossa clínica.
      </p>

      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#92400e;font-size:13px;width:40%;">💰 Valor</td>
            <td style="padding:8px 0;color:#78350f;font-size:18px;font-weight:700;">${formatCurrency(data.amount)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#92400e;font-size:13px;">📅 Vencimento</td>
            <td style="padding:8px 0;color:#78350f;font-size:14px;font-weight:600;">
              ${new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "long", year: "numeric" }).format(data.dueDate)}
            </td>
          </tr>
        </table>
      </div>

      <p style="font-size:13px;color:#94a3b8;line-height:1.6;margin:0;">
        Para regularizar a situação, contacte-nos.
      </p>
    </div>

    <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="font-size:12px;color:#94a3b8;margin:0;">${data.clinicName} · Enviado automaticamente</p>
    </div>
  </div>
</body>
</html>`;
  return { subject, html };
}

