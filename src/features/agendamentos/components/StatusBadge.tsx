import { Badge } from "@/components/ui/badge";
import type { AppointmentStatus } from "../schema";

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; variant: "default" | "success" | "secondary" | "destructive" | "warning" | "outline" }
> = {
  scheduled: { label: "Agendado", variant: "default" },
  completed: { label: "Concluído", variant: "success" },
  cancelled: { label: "Cancelado", variant: "destructive" },
  no_show: { label: "Não compareceu", variant: "warning" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as AppointmentStatus] ?? {
    label: status,
    variant: "secondary" as const,
  };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export { STATUS_CONFIG };

