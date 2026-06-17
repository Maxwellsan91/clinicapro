"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import type {
  EventClickArg,
  EventDropArg,
  DateSelectArg,
  EventContentArg,
} from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";
import ptLocale from "@fullcalendar/core/locales/pt";
import { toast } from "sonner";
import {
  getCalendarEvents,
  moveEventAction,
  type CalendarEvent,
} from "../calendarActions";
import { COLLABORATOR_COLORS } from "../calendarConstants";
import { EventModal } from "./EventModal";
import { QuickCreateModal } from "./QuickCreateModal";
import { Filter, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Client  { id: string; name: string }
interface Collab  { id: string; name: string; role: string; email: string | null }
interface Service { id: string; name: string; duration: number }
interface Resource { id: string; name: string; type: string; capacity: number }

interface Props {
  clientes: Client[];
  colaboradores: Collab[];
  servicos: Service[];
  recursos: Resource[];
}

// Mapa de cores por colaborador (calculado uma vez)
let colorMap: Record<string, string> = {};

function buildColorMap(cols: Collab[]) {
  colorMap = {};
  cols.forEach((c, i) => {
    colorMap[c.id] = COLLABORATOR_COLORS[i % COLLABORATOR_COLORS.length];
  });
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: "#3b82f6",
  completed:  "#10b981",
  cancelled:  "#6b7280",
  no_show:    "#ef4444",
};

export function AgendamentoCalendar({ clientes, colaboradores, servicos, recursos }: Props) {
  const calRef = useRef<FullCalendar>(null);
  const router = useRouter();

  const [events, setEvents]           = useState<CalendarEvent[]>([]);
  const [loading, setLoading]         = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [colorMode, setColorMode]     = useState<"status" | "collaborator">("status");
  const [filterCollab, setFilterCollab] = useState<string>("");
  const [quickCreate, setQuickCreate] = useState<{ start: string; end: string } | null>(null);

  useEffect(() => {
    buildColorMap(colaboradores);
  }, [colaboradores]);

  const loadEvents = useCallback(async (start: string, end: string) => {
    setLoading(true);
    try {
      const data = await getCalendarEvents(start, end, filterCollab || undefined);
      setEvents(data);
    } catch {
      toast.error("Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  }, [filterCollab]);

  // Recarregar quando filtro muda
  useEffect(() => {
    const cal = calRef.current;
    if (!cal) return;
    const view = cal.getApi().view;
    loadEvents(view.currentStart.toISOString(), view.currentEnd.toISOString());
  }, [filterCollab, loadEvents]);

  // Mapear events do FullCalendar com cores
  const fcEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end,
    backgroundColor: colorMode === "status"
      ? STATUS_COLORS[e.status] ?? "#3b82f6"
      : colorMap[e.collaboratorId] ?? "#3b82f6",
    borderColor: colorMode === "status"
      ? STATUS_COLORS[e.status] ?? "#3b82f6"
      : colorMap[e.collaboratorId] ?? "#3b82f6",
    textColor: "#ffffff",
    extendedProps: e,
  }));

  const handleEventClick = (arg: EventClickArg) => {
    const ext = arg.event.extendedProps as CalendarEvent;
    setSelectedEvent(ext);
  };

  const handleDateSelect = (arg: DateSelectArg) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const toLocal = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setQuickCreate({ start: toLocal(arg.start), end: toLocal(arg.end) });
    calRef.current?.getApi().unselect();
  };

  const handleEventDrop = async (arg: EventDropArg) => {
    const r = await moveEventAction(
      arg.event.id,
      arg.event.start!.toISOString(),
      arg.event.end!.toISOString()
    );
    if (!r.success) {
      toast.error(r.error);
      arg.revert();
    } else {
      toast.success("Agendamento movido");
      const cal = calRef.current?.getApi();
      if (cal) loadEvents(cal.view.currentStart.toISOString(), cal.view.currentEnd.toISOString());
    }
  };

  const handleEventResize = async (arg: EventResizeDoneArg) => {
    const r = await moveEventAction(
      arg.event.id,
      arg.event.start!.toISOString(),
      arg.event.end!.toISOString()
    );
    if (!r.success) {
      toast.error(r.error);
      arg.revert();
    } else {
      toast.success("Duração actualizada");
    }
  };

  const refreshCalendar = () => {
    const cal = calRef.current?.getApi();
    if (cal) loadEvents(cal.view.currentStart.toISOString(), cal.view.currentEnd.toISOString());
  };

  const renderEventContent = (arg: EventContentArg) => {
    const ext = arg.event.extendedProps as CalendarEvent;
    return (
      <div className="px-1 py-0.5 overflow-hidden h-full">
        <div className="font-semibold text-[11px] leading-tight truncate">{ext.clientName}</div>
        <div className="text-[10px] opacity-80 truncate">{ext.serviceName}</div>
        {arg.view.type.startsWith("timeGrid") && (
          <div className="text-[10px] opacity-70">{ext.collaboratorName}</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filtro colaborador */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterCollab}
            onChange={(e) => setFilterCollab(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os colaboradores</option>
            {colaboradores.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Modo de cores */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white">
          {(["status", "collaborator"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setColorMode(mode)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                colorMode === mode ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {mode === "status" ? "Por estado" : "Por colaborador"}
            </button>
          ))}
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-2 flex-wrap">
          {colorMode === "status" ? (
            Object.entries({ scheduled: "Agendado", completed: "Concluído", cancelled: "Cancelado", no_show: "Não compareceu" }).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1 text-xs text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: STATUS_COLORS[k] }} />
                {v}
              </span>
            ))
          ) : (
            colaboradores.slice(0, 5).map((c, i) => (
              <span key={c.id} className="flex items-center gap-1 text-xs text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLLABORATOR_COLORS[i % COLLABORATOR_COLORS.length] }} />
                {c.name}
              </span>
            ))
          )}
        </div>

        {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-500 ml-auto" />}
      </div>

      {/* Calendário */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <style>{`
          .fc { font-family: inherit; }
          .fc-toolbar-title { font-size: 1rem !important; font-weight: 600 !important; }
          .fc-button { background: #f8fafc !important; border-color: #e2e8f0 !important; color: #475569 !important; font-size: 0.75rem !important; font-weight: 500 !important; border-radius: 8px !important; padding: 6px 12px !important; }
          .fc-button:hover { background: #f1f5f9 !important; }
          .fc-button-active, .fc-button-primary:not(:disabled).fc-button-active { background: #2563eb !important; border-color: #2563eb !important; color: white !important; }
          .fc-event { cursor: pointer; border-radius: 6px !important; border: none !important; }
          .fc-event:hover { opacity: 0.9; }
          .fc-daygrid-event { padding: 2px 4px !important; }
          .fc-timegrid-event { border-radius: 6px !important; }
          .fc-col-header-cell { font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
          .fc-timegrid-slot-label { font-size: 0.7rem; color: #94a3b8; }
          .fc-today-button { display: none !important; }
          .fc-highlight { background: #dbeafe !important; }
          .fc-daygrid-day-number { font-size: 0.75rem; color: #64748b; }
          .fc-day-today .fc-daygrid-day-number { background: #2563eb; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; }
          @media (max-width: 640px) {
            .fc-toolbar { flex-direction: column; gap: 8px; }
            .fc-toolbar-title { font-size: 0.875rem !important; }
          }
        `}</style>
        <FullCalendar
          ref={calRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          locale={ptLocale}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          buttonText={{
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
            list: "Lista",
          }}
          events={fcEvents}
          editable
          selectable
          selectMirror
          dayMaxEvents
          weekends
          allDaySlot={false}
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          slotDuration="00:30:00"
          snapDuration="00:15:00"
          height="auto"
          contentHeight={650}
          eventClick={handleEventClick}
          select={handleDateSelect}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventContent={renderEventContent}
          datesSet={(arg) => loadEvents(arg.startStr, arg.endStr)}
          nowIndicator
          businessHours={{ daysOfWeek: [1,2,3,4,5,6], startTime: "08:00", endTime: "20:00" }}
          selectConstraint="businessHours"
          eventOverlap={false}
        />
      </div>

      {/* Modal de detalhe */}
      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEdit={(event) => {
          setSelectedEvent(null);
          router.push(`/agendamentos/${event.id}/editar`);
        }}
        onDeleted={() => {
          setSelectedEvent(null);
          refreshCalendar();
        }}
      />

      {/* Modal de criação rápida */}
      {quickCreate && (
        <QuickCreateModal
          open
          defaultStart={quickCreate.start}
          defaultEnd={quickCreate.end}
          clientes={clientes}
          colaboradores={colaboradores}
          servicos={servicos}
          recursos={recursos}
          onClose={() => setQuickCreate(null)}
          onCreated={() => {
            setQuickCreate(null);
            refreshCalendar();
          }}
        />
      )}
    </div>
  );
}
