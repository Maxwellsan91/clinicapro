"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimePicker } from "@/components/ui/TimePicker";
import { createAgendamentoAction, updateAgendamentoAction } from "../actions";
import { checkResourcesAvailabilityAction } from "../calendarActions";
import { APPOINTMENT_STATUS_VALUES } from "../schema";
import { RESOURCE_TYPE_LABELS, type ResourceType } from "@/features/recursos/schema";
import { DoorOpen, Dumbbell, TreePine, AlertTriangle, CheckCircle2, Lock } from "lucide-react";
import type { Client, Collaborator, Service, Appointment, Resource } from "@prisma/client";

// ── Constantes ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendado",
  completed: "Concluído",
  cancelled: "Cancelado",
  no_show:   "Não compareceu",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  room:      <DoorOpen  className="w-4 h-4 shrink-0" />,
  equipment: <Dumbbell  className="w-4 h-4 shrink-0" />,
  gym:       <TreePine  className="w-4 h-4 shrink-0" />,
};

// ── Tipos ─────────────────────────────────────────────────────────────────────

type AgendamentoWithRelations = Appointment & {
  client:       Pick<Client, "id" | "name">;
  collaborator: Pick<Collaborator, "id" | "name">;
  service:      Pick<Service, "id" | "name">;
  resources:    { resource: Pick<Resource, "id" | "name" | "type" | "capacity"> }[];
};

interface AgendamentoFormProps {
  agendamento?:  AgendamentoWithRelations;
  clientes:      Pick<Client, "id" | "name">[];
  colaboradores: Pick<Collaborator, "id" | "name" | "role">[];
  servicos:      Pick<Service, "id" | "name" | "duration">[];
  recursos:      Pick<Resource, "id" | "name" | "type" | "capacity">[];
}

// ── Helpers de data ───────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, "0");

function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
function toTimeStr(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function addMinutes(dateStr: string, timeStr: string, mins: number): { date: string; time: string } {
  const dt = new Date(`${dateStr}T${timeStr}`);
  dt.setMinutes(dt.getMinutes() + mins);
  return { date: toDateStr(dt), time: toTimeStr(dt) };
}
function combineISO(dateStr: string, timeStr: string) {
  return dateStr && timeStr ? `${dateStr}T${timeStr}` : "";
}

// ── Componente ────────────────────────────────────────────────────────────────

export function AgendamentoForm({
  agendamento,
  clientes,
  colaboradores,
  servicos,
  recursos,
}: AgendamentoFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!agendamento;

  // ── Inicializar datas a partir do agendamento existente
  function initDateParts(isoDate?: Date | null) {
    if (!isoDate) return { date: "", time: "" };
    const d = new Date(isoDate);
    return { date: toDateStr(d), time: toTimeStr(d) };
  }

  const startInit = initDateParts(agendamento?.startDateTime);
  const endInit   = initDateParts(agendamento?.endDateTime);

  // ── Estado controlado de todos os campos
  const [clientId,       setClientId]       = useState(agendamento?.clientId ?? "");
  const [collaboratorId, setCollaboratorId] = useState(agendamento?.collaboratorId ?? "");
  const [serviceId,      setServiceId]      = useState(agendamento?.serviceId ?? "");
  const [status,         setStatus]         = useState(agendamento?.status ?? "scheduled");
  const [startDate,      setStartDate]      = useState(startInit.date);
  const [startTime,      setStartTime]      = useState(startInit.time);
  const [endDate,        setEndDate]        = useState(endInit.date);
  const [endTime,        setEndTime]        = useState(endInit.time);
  const [notes,          setNotes]          = useState(agendamento?.notes ?? "");

  // ── Disponibilidade de recursos: quais estão ocupados no intervalo escolhido
  const [occupiedIds, setOccupiedIds] = useState<string[]>([]);
  const [occupiedBy,  setOccupiedBy]  = useState<Record<string, string>>({});
  const [occupiedTimeRange, setOccupiedTimeRange] = useState<Record<string, string>>({});
  const [occupiedCollaborator, setOccupiedCollaborator] = useState<Record<string, string>>({});
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // ── Recursos — estado controlado
  const [selectedResources, setSelectedResources] = useState<string[]>(
    agendamento?.resources.map((r) => r.resource.id) ?? [],
  );

  // ── Auto-calcular término ao mudar serviço ou horário de início
  useEffect(() => {
    if (!serviceId || !startDate || !startTime) return;
    const srv = servicos.find((s) => s.id === serviceId);
    if (!srv) return;
    const end = addMinutes(startDate, startTime, srv.duration);
    const timer = window.setTimeout(() => {
      setEndDate(end.date);
      setEndTime(end.time);
    }, 0);
    return () => window.clearTimeout(timer);
  // Só disparar quando serviceId, startDate ou startTime mudam
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, startDate, startTime]);

  // ── Verificar disponibilidade de recursos sempre que o intervalo muda
  useEffect(() => {
    const startISO = combineISO(startDate, startTime);
    const endISO   = combineISO(endDate, endTime);
    if (!startISO || !endISO || startISO >= endISO) {
      const timer = window.setTimeout(() => {
        setOccupiedIds([]);
        setOccupiedBy({});
        setOccupiedTimeRange({});
        setOccupiedCollaborator({});
      }, 0);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => {
      setCheckingAvailability(true);
      checkResourcesAvailabilityAction(startISO, endISO, agendamento?.id)
        .then(({ occupiedIds, occupiedBy, occupiedTimeRange, occupiedCollaborator }) => {
          setOccupiedIds(occupiedIds);
          setOccupiedBy(occupiedBy);
          setOccupiedTimeRange(occupiedTimeRange);
          setOccupiedCollaborator(occupiedCollaborator);
          // Remover recursos que ficaram ocupados da selecção actual
          setSelectedResources((prev) => prev.filter((id) => !occupiedIds.includes(id)));
        })
        .finally(() => setCheckingAvailability(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [startDate, startTime, endDate, endTime, collaboratorId, agendamento?.id]);

  const toggleResource = useCallback((id: string) => {
    setSelectedResources((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  }, []);

  // ── Submit
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    setError(null);

    const startISO = combineISO(startDate, startTime);
    const endISO   = combineISO(endDate, endTime);

    if (!clientId)       { setError("Selecione um cliente.");                   return; }
    if (!collaboratorId) { setError("Selecione um colaborador.");                return; }
    if (!serviceId)      { setError("Selecione um serviço.");                    return; }
    if (!startISO)       { setError("Preencha a data e hora de início.");         return; }
    if (!endISO)         { setError("Preencha a data e hora de término.");        return; }
    if (startISO >= endISO) { setError("O término deve ser após o início.");      return; }
    if (selectedResources.some((id) => occupiedIds.includes(id))) {
      setError("A sala/equipamento selecionado já está reservado neste horário.");
      return;
    }

    const fd = new FormData();
    fd.set("clientId",       clientId);
    fd.set("collaboratorId", collaboratorId);
    fd.set("serviceId",      serviceId);
    fd.set("status",         status);
    fd.set("startDateTime",  startISO);
    fd.set("endDateTime",    endISO);
    fd.set("notes",          notes);
    selectedResources.forEach((id) => fd.append("resourceIds", id));

    const action = isEditing
      ? updateAgendamentoAction.bind(null, agendamento.id)
      : createAgendamentoAction;

    startTransition(async () => {
      const result = await (action as (f: FormData) => Promise<{ success: false; error: Record<string, string[]> } | undefined>)(fd);
      if (result && !result.success) {
        const msgs = Object.values(result.error).flat();
        setError(msgs[0] ?? "Erro desconhecido");
      }
    });
  }

  // Agrupar recursos por tipo
  const byType = recursos.reduce<Record<string, typeof recursos>>((acc, r) => {
    (acc[r.type] = acc[r.type] ?? []).push(r);
    return acc;
  }, {});

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">

      {/* ── Erro global ── */}
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Secção 1: Pessoas e serviço ── */}
      <div className="space-y-1">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Dados do agendamento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Cliente */}
          <div className="space-y-1.5">
            <Label htmlFor="clientId">Cliente <span className="text-red-500">*</span></Label>
            <Select
              id="clientId"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>

          {/* Colaborador */}
          <div className="space-y-1.5">
            <Label htmlFor="collaboratorId">Colaborador <span className="text-red-500">*</span></Label>
            <Select
              id="collaboratorId"
              value={collaboratorId}
              onChange={(e) => setCollaboratorId(e.target.value)}
            >
              <option value="">Selecione um colaborador</option>
              {colaboradores.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.role}</option>
              ))}
            </Select>
          </div>

          {/* Serviço */}
          <div className="space-y-1.5">
            <Label htmlFor="serviceId">Serviço <span className="text-red-500">*</span></Label>
            <Select
              id="serviceId"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
            >
              <option value="">Selecione um serviço</option>
              {servicos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.duration} min)
                </option>
              ))}
            </Select>
            {serviceId && (
              <p className="text-[11px] text-blue-600 font-medium pl-0.5">
                ✦ Término calculado automaticamente com base na duração
              </p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {APPOINTMENT_STATUS_VALUES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* ── Secção 2: Datas e horas ── */}
      <div className="space-y-1">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Data e hora
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Início */}
          <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Início <span className="text-red-500">*</span>
            </p>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-[11px] text-gray-400 font-normal">Data</Label>
                <DatePicker value={startDate} onChange={setStartDate} />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-gray-400 font-normal">Hora</Label>
                <TimePicker value={startTime} onChange={setStartTime} />
              </div>
            </div>
          </div>

          {/* Término */}
          <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Término <span className="text-red-500">*</span>
            </p>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-[11px] text-gray-400 font-normal">Data</Label>
                <DatePicker value={endDate} onChange={setEndDate} />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-gray-400 font-normal">Hora</Label>
                <TimePicker value={endTime} onChange={setEndTime} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {recursos.length > 0 && (
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            Salas / Equipamentos
            {checkingAvailability && (
              <span className="text-[10px] font-normal text-blue-500 normal-case tracking-normal">
                A verificar disponibilidade…
              </span>
            )}
          </h3>
          <div className="pt-2 space-y-4">
            {Object.entries(byType).map(([type, items]) => (
              <div key={type}>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-2">
                  {TYPE_ICONS[type]}
                  {RESOURCE_TYPE_LABELS[type as ResourceType] ?? type}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {items.map((r) => {
                    const checked  = selectedResources.includes(r.id);
                    const occupied = occupiedIds.includes(r.id);
                    const bookedBy = occupiedBy[r.id];
                    const bookedRange = occupiedTimeRange[r.id];
                    const bookedCollaborator = occupiedCollaborator[r.id];

                    if (occupied) {
                      // ── Card bloqueado ──────────────────────────────────
                      return (
                        <div
                          key={r.id}
                          title={bookedBy ? `Reservado por: ${bookedBy}` : "Já reservado neste horário"}
                          className="flex items-start gap-3 w-full px-3.5 py-3 rounded-xl border
                            border-red-200 bg-red-50/60 text-red-500 text-sm cursor-not-allowed select-none"
                        >
                          <Lock className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                          <span className="flex-1 min-w-0">
                            <span className="block font-medium line-through">{r.name}</span>
                            {bookedRange && (
                              <span className="block text-[11px] text-red-500">
                                Ocupada das {bookedRange.replace("-", " às ")}
                              </span>
                            )}
                            {bookedBy && (
                              <span className="block text-[11px] text-red-400">
                                Reservada por {bookedBy}{bookedCollaborator ? ` / ${bookedCollaborator}` : ""}
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    }

                    // ── Card disponível ─────────────────────────────────
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={(e) => { e.preventDefault(); toggleResource(r.id); }}
                        className={[
                          "flex items-center gap-3 w-full px-3.5 py-3 rounded-xl border text-sm text-left transition-all duration-150",
                          checked
                            ? "bg-blue-50 border-blue-400 text-blue-800 font-medium shadow-sm ring-1 ring-blue-200"
                            : "bg-white border-gray-200 text-gray-700 hover:border-blue-200 hover:bg-blue-50/30",
                        ].join(" ")}
                      >
                        <span className={[
                          "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                          checked ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white",
                        ].join(" ")}>
                          {checked && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span className="flex-1">{r.name}</span>
                        {checked && <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {selectedResources.length > 0 && (
            <p className="text-xs text-blue-600 font-medium pt-1">
              ✓ {selectedResources.length} recurso{selectedResources.length !== 1 ? "s" : ""} selecionado{selectedResources.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {/* ── Observações ── */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Informações adicionais sobre o agendamento..."
          rows={3}
        />
      </div>

      {/* ── Acções ── */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "A salvar..." : isEditing ? "Salvar Alterações" : "Criar Agendamento"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/agendamentos")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
