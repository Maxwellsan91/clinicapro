"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateClienteNotesAction } from "@/features/clientes/actions";
import { Edit, Save, X } from "lucide-react";

interface Props {
  clienteId: string;
  initialNotes: string;
}

export function ClienteNotes({ clienteId, initialNotes }: Props) {
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateClienteNotesAction(clienteId, notes);
      if (result.success) {
        setEditing(false);
      }
    });
  }

  if (!editing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Observações</h3>
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
        </div>
        <p className="text-sm text-gray-900 whitespace-pre-wrap min-h-[40px]">
          {notes || "Nenhuma observação registada."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Observações</h3>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        placeholder="Adicionar observações sobre o utente..."
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          <Save className="w-4 h-4 mr-1" />
          {isPending ? "A guardar..." : "Guardar"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => { setEditing(false); setNotes(initialNotes); }}>
          <X className="w-4 h-4 mr-1" />
          Cancelar
        </Button>
      </div>
    </div>
  );
}

