import { Badge } from "@/components/ui/badge";
import type { PaymentStatus, InvoiceStatus } from "../schema";

const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  {
    label: string;
    variant: "default" | "success" | "secondary" | "destructive" | "warning" | "outline";
  }
> = {
  pending:   { label: "Pendente",   variant: "warning" },
  paid:      { label: "Pago",       variant: "success" },
  partial:   { label: "Parcial",    variant: "default" },
  cancelled: { label: "Cancelado",  variant: "destructive" },
};

const INVOICE_STATUS_CONFIG: Record<
  InvoiceStatus,
  {
    label: string;
    variant: "default" | "success" | "secondary" | "destructive" | "warning" | "outline";
  }
> = {
  not_issued: { label: "Por emitir", variant: "secondary" },
  issued:     { label: "Emitida",    variant: "success" },
};

export function PaymentStatusBadge({ status }: { status: string }) {
  const config = PAYMENT_STATUS_CONFIG[status as PaymentStatus] ?? {
    label: status,
    variant: "secondary" as const,
  };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function InvoiceStatusBadge({ status }: { status: string }) {
  const config = INVOICE_STATUS_CONFIG[status as InvoiceStatus] ?? {
    label: status,
    variant: "secondary" as const,
  };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export { PAYMENT_STATUS_CONFIG, INVOICE_STATUS_CONFIG };

