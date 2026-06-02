"use client";

import { useTransition } from "react";
import { updateUserRole, deleteUser, type UserWithRole } from "@/features/auth/userActions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, User, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  users: UserWithRole[];
  currentUserId: string;
}

export function UserList({ users, currentUserId }: Props) {
  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Função</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <UserRow key={u.id} user={u} isCurrentUser={u.id === currentUserId} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function UserRow({ user, isCurrentUser }: { user: UserWithRole; isCurrentUser: boolean }) {
  const [isPending, startTransition] = useTransition();

  const toggleRole = () => {
    const newRole = user.role === "admin" ? "user" : "admin";
    startTransition(async () => {
      const result = await updateUserRole(user.id, newRole);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`Tem a certeza que pretende eliminar ${user.email}?`)) return;
    startTransition(async () => {
      const result = await deleteUser(user.id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        {user.email}
        {isCurrentUser && (
          <span className="ml-2 text-xs text-slate-400">(você)</span>
        )}
      </TableCell>
      <TableCell className="text-slate-500 text-sm">
        {user.jobTitle || <span className="text-slate-300 italic">—</span>}
      </TableCell>
      <TableCell className="text-slate-500 text-sm">
        {new Date(user.createdAt).toLocaleDateString("pt-PT")}
      </TableCell>
      <TableCell>
        {user.role === "admin" ? (
          <Badge className="bg-blue-100 text-blue-700 gap-1">
            <ShieldCheck className="w-3 h-3" />
            Administrador
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1">
            <User className="w-3 h-3" />
            Utilizador
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={toggleRole}
            disabled={isPending || isCurrentUser}
            title={isCurrentUser ? "Não pode alterar o seu próprio role" : undefined}
          >
            {isPending
              ? "..."
              : user.role === "admin"
              ? "Remover admin"
              : "Tornar admin"}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleDelete}
            disabled={isPending || isCurrentUser}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            title={isCurrentUser ? "Não pode eliminar a si próprio" : "Eliminar utilizador"}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

