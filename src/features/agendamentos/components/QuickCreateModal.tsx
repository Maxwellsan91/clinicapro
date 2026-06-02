"use client";

import { useEffect, useState, useTransition } from "react";
import { X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { checkOverlapAction } from "../calendarActions";
import { createAgendamentoAction } from "../actions";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimePicker } from "@/components/ui/TimePicker";

interface Client  { id: string; name: string }
interface Collab  { id: string; name: string; role: string }
interface Service { id: string; name: string; duration: number }

interface Props {
  open: boolean;
  defaultStart: string;
  defaultEnd: string;
  clientes: Client[];
  colaboradores: Collab[];
  servicos: Service[];
  onClose: () => void;
  onCreated: () => void;
}

const pad = (n: number) => String(n).padStart(2, "0");

function splitDT(dt: string) {
  if (!dt) return { date: "", time: "" };
  const [d, t] = dt.split("T");
  return { date: d ?? "", time: t?.slice(0, 5) ?? "" };
}

function combineDT(date: string, time: string) {
  return date && time ? `${date}T${time}` : "";
}

function addMinutes(dt: string, mins: number): { date: string; time: string } {
  if (!dt) return { date: "", time: "" };
  const d = new Date(dt);
  d.setMinutes(d.getMinutes() + mins);
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

export function QuickCreateModal({
  open, defaultStart, defaultEnd,
  clientes, colaboradores, servicos,
  onClose, onCreated,
}: Props) {
  const initStart = splitDT(defaultStart);
  const initEnd   = splitDT(defaultEnd);

  const [isPending, startTransition] = useTransition();
  const [clientId, setClientId]             = useState("");
  const [collaboratorId, setCollaboratorId] = useState("");
  const [serviceId, setServiceId]           = useState("");
  const [startDate, setStartDate] = useState(initStart.date);
  const [startTime, setStartTime] = useState(initStart.time);
  const [endDate, setEndDate]     = useState(initEnd.date);
  const [endTime, setEndTime]     = useState(initEnd.time);
  const [notes, setNotes]         = useState("");
  const [overlap, setOverlap]     = useState<string | null>(null);
  const [checking, setChecking]   = useState(false);

  // Reset ao abrir
  useEffect(() => {
    const s = splitDT(defaultStart);
    const e = splitDT(defaultEnd);
    setStartDate(s.date); setStartTime(s.time);
    setEndDate(e.date);   setEndTime(e.time);
    setClientId(""); setCollaboratorId(""); setServiceId("");
    setNotes(""); setOverlap(null);
  }, [defaultStart, defaultEnd, open]);

  // Auto-calcular fim quando serviço muda
  useEffect(() => {
    const start = combineDT(startDate, startTime);
    if (serviceId && start) {
      const srv = servicos.find((s) => s.id === serviceId);
      if (srv) {
        const e = addMinutes(start, srv.duration);
        setEndDate(e.date); setEndTime(e.time);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, startDate, startTime]);

  // Verificar sobreposição
  useEffect(() => {
    const start = combineDT(startDate, startTime);
    const end   = combineDT(endDate, endTime);
    if (!collaboratorId || !start || !end) { setOverlap(null); return; }
    setChecking(true);
    checkOverlapAction(collaboratorId, new Date(start).toISOString(), new Date(end).toISOString())
      .then((r) => setOverlap(r.hasOverlap ? (r.conflictWith ?? "outro agendamento") : null))
      .finally(() => setChecking(false));
  }, [collaboratorId, startDate, startTime, endDate, endTime]);

  if (!open) return null;

  const start = combineDT(startDate, startTime);
  const end   = combineDT(endDate, endTime);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!start || !end) { toast.error("Preencha a data e hora de início e fim."); return; }
    if (start >= end)   { toast.error("O término deve ser após o início.");       return; }
    if (overlap)        { toast.error("Há sobreposição de horário. Corrija antes de guardar."); return; }

    const fd = new FormData();
    fd.set("clientId", clientId);
    fd.set("collaboratorId", collaboratorId);
    fd.set("serviceId", serviceId);
    fd.set("startDateTime", new Date(start).toISOString());
    fd.set("endDateTime", new Date(end).toISOString());
    fd.set("status", "scheduled");
    fd.set("notes", notes);

    startTransition(async () => {
      const r = await createAgendamentoAction(fd);
      if (!r) {
        toast.success("Agendamento criado!");
        onCreated(); onClose();
      } else if ("error" in r) {
        const msg = Object.values(r.error).flat()[0];
        toast.error(msg ?? "Erro ao criar agendamento.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Novo Agendamento</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          {overlap && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Sobreposição com <strong>{overlap}</strong> neste horário.</span>
            </div>
          )}

          {/* Início e Fim com DatePicker + TimePicker */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Início <span className="text-red-500">*</span></p>
              <div className="space-y-1.5">
                <DatePicker value={startDate} onChange={setStartDate} placeholder="dd/mm/aaaa" />
                <TimePicker value={startTime} onChange={setStartTime} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Fim <span className="text-red-500">*</span></p>
              <div className="space-y-1.5">
                <DatePicker value={endDate} onChange={setEndDate} placeholder="dd/mm/aaaa" />
                <TimePicker value={endTime} onChange={setEndTime} />
              </div>
            </div>
          </div>

          <Field label="Utente" required>
            <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={selectCls}>
              <option value="">Seleccionar utente…</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>

          <Field label="Colaborador" required>
            <select value={collaboratorId} onChange={(e) => setCollaboratorId(e.target.value)} className={selectCls}>
              <option value="">Seleccionar colaborador…</option>
              {colaboradores.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.role}</option>)}
            </select>
          </Field>

          <Field label="Serviço" required>
            <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className={selectCls}>
              <option value="">Seleccionar serviço…</option>
              {servicos.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.duration} min)</option>)}
            </select>
          </Field>

          <Field label="Notas">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className={selectCls} placeholder="Observações (opcional)" />
          </Field>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isPending || !!overlap || checking}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {isPending ? "A criar…" : checking ? "A verificar…" : "Criar agendamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const selectCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

