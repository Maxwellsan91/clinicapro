import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { isAdmin } from "@/features/auth/actions";
import { getAuditLogs } from "@/features/auditoria/queries";
import { AuditLogTable } from "@/features/auditoria/components/AuditLogTable";
import { AuditFilters } from "@/features/auditoria/components/AuditFilters";
import { Header } from "@/components/layout/Header";
import { Shield, ClipboardList } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Auditoria" };

interface Props {
  searchParams: Promise<{ entity?: string; action?: string; page?: string }>;
}

export default async function AuditoriaPage({ searchParams }: Props) {
  const admin = await isAdmin();
  if (!admin) redirect("/dashboard");

  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1", 10);

  const { logs, total, pageSize } = await getAuditLogs({
    entity: sp.entity,
    action: sp.action,
    page,
  });

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <Header title="Auditoria" description="Registo completo de todas as operações do sistema" />

      <div className="p-6 space-y-6">
        {/* Stats rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total de registos", value: total.toLocaleString("pt-PT"), icon: ClipboardList, color: "text-blue-600 bg-blue-50" },
            { label: "Esta página", value: logs.length.toString(), icon: Shield, color: "text-slate-600 bg-slate-50" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.color}`}><Icon className="w-4 h-4" /></div>
                <div>
                  <p className="text-xs text-slate-400">{s.label}</p>
                  <p className="text-xl font-bold text-slate-900">{s.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filtros */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Suspense>
            <AuditFilters />
          </Suspense>
          <p className="text-xs text-slate-400">
            {total} {total === 1 ? "registo" : "registos"} · página {page} de {totalPages || 1}
          </p>
        </div>

        {/* Tabela */}
        <AuditLogTable logs={logs} />

        {/* Paginação */}
        {totalPages > 1 && (
          <Suspense>
            <Pagination page={page} totalPages={totalPages} entity={sp.entity} action={sp.action} />
          </Suspense>
        )}
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, entity, action }: {
  page: number; totalPages: number; entity?: string; action?: string;
}) {
  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (entity) params.set("entity", entity);
    if (action) params.set("action", action);
    params.set("page", p.toString());
    return `/auditoria?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {page > 1 && (
        <a href={buildHref(page - 1)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          ← Anterior
        </a>
      )}
      <span className="text-sm text-slate-500 px-3">
        {page} / {totalPages}
      </span>
      {page < totalPages && (
        <a href={buildHref(page + 1)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          Próxima →
        </a>
      )}
    </div>
  );
}

