
const ENTITIES = ["Cliente", "Colaborador", "Servico", "Agendamento", "Pagamento", "Utilizador"];
const ACTIONS  = ["CREATE", "UPDATE", "DELETE", "CANCEL", "MARK_PAID", "MARK_PENDING", "ROLE_CHANGE"];
const ACTION_LABELS: Record<string, string> = {
  CREATE: "Criação", UPDATE: "Edição", DELETE: "Eliminação",
  CANCEL: "Cancelamento", MARK_PAID: "Marcado Pago",
  MARK_PENDING: "Marcado Pendente", ROLE_CHANGE: "Role Alterado",
};
const ENTITY_LABELS: Record<string, string> = {
  Cliente: "Utente", Colaborador: "Colaborador", Servico: "Serviço",
  Agendamento: "Agendamento", Pagamento: "Pagamento", Utilizador: "Utilizador",
};

export function AuditFilters() {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();

  const update = useCallback((key: string, value: string) => {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.delete("page");
    router.push(`${pathname}?${p.toString()}`);
  }, [params, pathname, router]);

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={params.get("entity") ?? ""}
        onChange={(e) => update("entity", e.target.value)}
        className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todas as entidades</option>
        {ENTITIES.map((e) => <option key={e} value={e}>{ENTITY_LABELS[e]}</option>)}
      </select>

      <select
        value={params.get("action") ?? ""}
        onChange={(e) => update("action", e.target.value)}
        className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todas as ações</option>
        {ACTIONS.map((a) => <option key={a} value={a}>{ACTION_LABELS[a]}</option>)}
      </select>

      {(params.get("entity") || params.get("action")) && (
        <button
          onClick={() => router.push(pathname)}
          className="text-sm text-slate-500 hover:text-red-500 px-3 py-2 rounded-lg border border-slate-200 hover:border-red-200 transition-colors"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}

