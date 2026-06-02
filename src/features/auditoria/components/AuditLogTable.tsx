import type { AuditLog } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const ACTION_CONFIG: Record<string, { label: string; color: string }> = {
  CREATE:       { label: "Criação",        color: "bg-green-100 text-green-700 border-green-200" },
  UPDATE:       { label: "Edição",         color: "bg-blue-100 text-blue-700 border-blue-200" },
  DELETE:       { label: "Eliminação",     color: "bg-red-100 text-red-700 border-red-200" },
  CANCEL:       { label: "Cancelamento",   color: "bg-orange-100 text-orange-700 border-orange-200" },
  MARK_PAID:    { label: "Marcado Pago",   color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  MARK_PENDING: { label: "Marcado Pend.",  color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  ROLE_CHANGE:  { label: "Role Alterado",  color: "bg-purple-100 text-purple-700 border-purple-200" },
  STATUS_CHANGE:{ label: "Estado Alterado",color: "bg-slate-100 text-slate-700 border-slate-200" },
};

const ENTITY_CONFIG: Record<string, { label: string; color: string }> = {
  Cliente:      { label: "Utente",      color: "bg-blue-50 text-blue-600" },
  Colaborador:  { label: "Colaborador", color: "bg-purple-50 text-purple-600" },
  Servico:      { label: "Serviço",     color: "bg-green-50 text-green-600" },
  Agendamento:  { label: "Agendamento", color: "bg-orange-50 text-orange-600" },
  Pagamento:    { label: "Pagamento",   color: "bg-emerald-50 text-emerald-600" },
  Utilizador:   { label: "Utilizador",  color: "bg-red-50 text-red-600" },
};

interface Props {
  logs: AuditLog[];
}

export function AuditLogTable({ logs }: Props) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="text-sm">Nenhum registo de auditoria encontrado.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Utilizador</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ação</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Entidade</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Detalhes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => {
            const actionCfg = ACTION_CONFIG[log.action] ?? { label: log.action, color: "bg-slate-100 text-slate-700" };
            const entityCfg = ENTITY_CONFIG[log.entity] ?? { label: log.entity, color: "bg-slate-50 text-slate-600" };
            const metadata = log.metadata as Record<string, unknown> | null;

            return (
              <TableRow key={log.id} className="hover:bg-slate-50/50">
                <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                  <div>{new Date(log.createdAt).toLocaleDateString("pt-PT")}</div>
                  <div className="text-slate-400">{new Date(log.createdAt).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</div>
                </TableCell>
                <TableCell className="text-sm">
                  <div className="font-medium text-slate-900 truncate max-w-[160px]">
                    {log.userEmail ?? log.userId.slice(0, 8) + "…"}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${actionCfg.color}`}>
                    {actionCfg.label}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${entityCfg.color}`}>
                    {entityCfg.label}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-slate-400 font-mono">
                  {log.entityId ? log.entityId.slice(0, 8) + "…" : "—"}
                </TableCell>
                <TableCell className="text-xs text-slate-500 max-w-[200px]">
                  {metadata ? (
                    <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded text-[11px] text-slate-600 truncate block">
                      {Object.entries(metadata)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" · ")}
                    </span>
                  ) : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

