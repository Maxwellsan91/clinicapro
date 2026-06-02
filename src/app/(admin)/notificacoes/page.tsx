export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { getNotifications } from "@/server/services/notification-service";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, XCircle, Clock, Send, Mail } from "lucide-react";

export const metadata: Metadata = { title: "Notificações" };

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  appointment_reminder:   { label: "Lembrete",      color: "bg-blue-100 text-blue-700",    icon: "🔔" },
  appointment_cancelled:  { label: "Cancelamento",  color: "bg-red-100 text-red-700",      icon: "❌" },
  payment_pending:        { label: "Pag. Pendente", color: "bg-yellow-100 text-yellow-700",icon: "💳" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  pending:   { label: "Pendente",  color: "bg-yellow-100 text-yellow-700", Icon: Clock },
  sent:      { label: "Enviado",   color: "bg-green-100 text-green-700",   Icon: CheckCircle },
  failed:    { label: "Falhou",    color: "bg-red-100 text-red-700",       Icon: XCircle },
  cancelled: { label: "Cancelado", color: "bg-gray-100 text-gray-600",     Icon: XCircle },
};

interface Props {
  searchParams: Promise<{ status?: string; type?: string; page?: string }>;
}

async function NotificacoesContent({ searchParams }: Props) {
  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1");
  const { notifications, total, pageSize } = await getNotifications({
    status: sp.status as never,
    type: sp.type as never,
    page,
  });
  const totalPages = Math.ceil(total / pageSize);

  // Stats
  const [pending, sent, failed] = await Promise.all([
    getNotifications({ status: "pending", page: 1 }).then((r) => r.total),
    getNotifications({ status: "sent",    page: 1 }).then((r) => r.total),
    getNotifications({ status: "failed",  page: 1 }).then((r) => r.total),
  ]);

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total",    value: total,   Icon: Bell,         bg: "bg-slate-50",   text: "text-slate-600" },
          { label: "Enviados", value: sent,    Icon: CheckCircle,  bg: "bg-green-50",   text: "text-green-600" },
          { label: "Pendentes",value: pending, Icon: Clock,        bg: "bg-yellow-50",  text: "text-yellow-600" },
          { label: "Falhados", value: failed,  Icon: XCircle,      bg: "bg-red-50",     text: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${s.bg}`}>
              <s.Icon className={`w-4 h-4 ${s.text}`} />
            </div>
            <div>
              <p className="text-xs text-slate-400">{s.label}</p>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <FilterLink href="/notificacoes" active={!sp.status && !sp.type} label="Todos" />
        <FilterLink href="/notificacoes?status=pending"  active={sp.status === "pending"}  label="Pendentes" />
        <FilterLink href="/notificacoes?status=sent"     active={sp.status === "sent"}     label="Enviados" />
        <FilterLink href="/notificacoes?status=failed"   active={sp.status === "failed"}   label="Falhados" />
        <FilterLink href="/notificacoes?type=appointment_reminder"  active={sp.type === "appointment_reminder"}  label="Lembretes" />
        <FilterLink href="/notificacoes?type=appointment_cancelled" active={sp.type === "appointment_cancelled"} label="Cancelamentos" />
        <FilterLink href="/notificacoes?type=payment_pending"       active={sp.type === "payment_pending"}       label="Pagamentos" />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhuma notificação encontrada.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {["Tipo", "Destinatário", "Assunto", "Estado", "Data"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {notifications.map((n) => {
                const typeCfg   = TYPE_CONFIG[n.type]   ?? { label: n.type, color: "bg-slate-100 text-slate-700", icon: "📧" };
                const statusCfg = STATUS_CONFIG[n.status] ?? STATUS_CONFIG.pending;
                const StatusIcon = statusCfg.Icon;
                return (
                  <tr key={n.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeCfg.color}`}>
                        <span>{typeCfg.icon}</span>
                        {typeCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 font-mono">{n.recipient}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate">{n.title}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusCfg.label}
                      </span>
                      {n.errorMessage && (
                        <p className="text-[10px] text-red-400 mt-0.5 max-w-[160px] truncate" title={n.errorMessage}>
                          {n.errorMessage}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                      <div>{new Date(n.createdAt).toLocaleDateString("pt-PT")}</div>
                      <div>{new Date(n.createdAt).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</div>
                      {n.sentAt && (
                        <div className="text-green-500">
                          Enviado {new Date(n.sentAt).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <a href={buildHref(page - 1, sp)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              ← Anterior
            </a>
          )}
          <span className="text-sm text-slate-500 px-3">{page} / {totalPages}</span>
          {page < totalPages && (
            <a href={buildHref(page + 1, sp)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Próxima →
            </a>
          )}
        </div>
      )}

      {/* Info sobre cron */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Send className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-800">Processamento automático</p>
            <p className="text-xs text-blue-600 mt-1">
              As notificações são processadas automaticamente a cada hora via{" "}
              <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono">POST /api/cron/notifications</code>.
              Configure o cron no seu provedor de hosting (Vercel, Render, etc.) ou use um serviço externo como o{" "}
              <strong>cron-job.org</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <a
      href={href}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
      }`}
    >
      {label}
    </a>
  );
}

function buildHref(page: number, sp: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  if (sp.status) params.set("status", sp.status);
  if (sp.type)   params.set("type",   sp.type);
  params.set("page", String(page));
  return `/notificacoes?${params.toString()}`;
}

export default function NotificacoesPage({ searchParams }: Props) {
  return (
    <div>
      <Header title="Notificações" description="Gestão de emails automáticos enviados ao utentes" />
      <Suspense fallback={<div className="p-6 animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl" />)}</div>}>
        <NotificacoesContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

