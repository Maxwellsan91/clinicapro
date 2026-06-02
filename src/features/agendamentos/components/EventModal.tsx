"use client";

import { useEffect, useState, useTransition } from "react";
import { X, Edit, Trash2, CheckCircle, XCircle, Clock, User, Briefcase, UserCog, StickyNote } from "lucide-react";
import { toast } from "sonner";
import type { CalendarEvent } from "../calendarActions";
import { updateEventStatusAction, deleteEventAction } from "../calendarActions";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Agendado",       color: "bg-blue-100 text-blue-700" },
  completed:  { label: "Concluído",      color: "bg-emerald-100 text-emerald-700" },
  cancelled:  { label: "Cancelado",      color: "bg-gray-100 text-gray-700" },
  no_show:    { label: "Não compareceu", color: "bg-red-100 text-red-700" },
};

interface Props {
  event: CalendarEvent | null;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDeleted: () => void;
}

export function EventModal({ event, onClose, onEdit, onDeleted }: Props) {
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setConfirmDelete(false);
  }, [event]);

  if (!event) return null;

  const statusCfg = STATUS_LABELS[event.status] ?? STATUS_LABELS.scheduled;

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso));

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      const r = await updateEventStatusAction(event.id, newStatus);
      if (r.success) {
        toast.success("Estado actualizado");
        onDeleted(); // refresh calendar
      } else {
        toast.error(r.error);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const r = await deleteEventAction(event.id);
      if (r.success) {
        toast.success("Agendamento eliminado");
        onDeleted();
      } else {
        toast.error(r.error);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header colorido pelo status */}
        <div className="p-5 flex items-start justify-between" style={{ backgroundColor: event.color }}>
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white mb-2">
              {statusCfg.label}
            </span>
            <h2 className="text-lg font-bold text-white truncate">{event.clientName}</h2>
            <p className="text-white/80 text-sm">{event.serviceName}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white ml-3 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          <InfoRow icon={Clock} label="Início" value={fmt(event.start)} />
          <InfoRow icon={Clock} label="Fim" value={fmt(event.end)} />
          <InfoRow icon={User} label="Utente" value={event.clientName} />
          <InfoRow icon={UserCog} label="Colaborador" value={event.collaboratorName} />
          <InfoRow icon={Briefcase} label="Serviço" value={event.serviceName} />
          {event.notes && <InfoRow icon={StickyNote} label="Notas" value={event.notes} />}
        </div>

        {/* Acções de estado rápidas */}
        {event.status !== "completed" && event.status !== "cancelled" && (
          <div className="px-5 pb-3 flex gap-2">
            <button
              onClick={() => handleStatusChange("completed")}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" /> Concluir
            </button>
            <button
              onClick={() => handleStatusChange("cancelled")}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" /> Cancelar
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 pb-5 flex items-center justify-between border-t border-gray-100 pt-3">
          {confirmDelete ? (
            <div className="flex items-center gap-2 w-full">
              <span className="text-sm text-red-600 flex-1">Tem a certeza?</span>
              <button onClick={() => setConfirmDelete(false)} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200">
                Não
              </button>
              <button onClick={handleDelete} disabled={isPending} className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                {isPending ? "A eliminar…" : "Eliminar"}
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" /> Eliminar
              </button>
              <button
                onClick={() => onEdit(event)}
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" /> Editar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <div>
        <p className="text-xs text-gray-400 leading-none mb-0.5">{label}</p>
        <p className="text-sm text-gray-800">{value}</p>
      </div>
    </div>
  );
}

