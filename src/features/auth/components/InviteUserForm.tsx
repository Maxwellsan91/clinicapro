"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { inviteUser } from "@/features/auth/userActions";
import { toast } from "sonner";
import { UserPlus, X } from "lucide-react";

export function InviteUserForm() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    startTransition(async () => {
      const result = await inviteUser(email.trim(), role, password);
      if (result.success) {
        toast.success(result.message);
        setEmail("");
        setPassword("");
        setRole("user");
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-3">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 text-white px-3 py-2 text-xs font-medium hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Criar Novo Utilizador
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">Criar novo utilizador</h3>
            <button type="button" onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="invite-email">E-mail</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="fisioterapeuta@clinica.pt"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="invite-password">Palavra-passe</Label>
              <Input
                id="invite-password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Select value={role} onChange={(e) => setRole(e.target.value as "admin" | "user")}>
                <option value="user">Utilizador</option>
                <option value="admin">Administrador</option>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "A criar..." : "Criar Utilizador"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
