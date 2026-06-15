"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteCommissionPaymentAction } from "../commissionPaymentActions";

interface Props {
  id: string;
  colaboradorId: string;
}

export function DeleteCommissionPaymentButton({ id, colaboradorId }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Tem a certeza que pretende remover este registo de pagamento?")) return;
        startTransition(async () => {
          const res = await deleteCommissionPaymentAction(id, colaboradorId);
          if (res.success) {
            toast.success("Registo removido.");
          } else {
            toast.error(res.error);
          }
        });
      }}
      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
      title="Remover registo"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}

