import { listUsers } from "@/features/auth/userActions";
import { getUser, isAdmin } from "@/features/auth/actions";
import { UserList } from "@/features/auth/components/UserList";
import { redirect } from "next/navigation";
import { ShieldCheck, UserPlus } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gestão de Utilizadores" };

interface Props {
  searchParams: Promise<{ success?: string }>;
}

export default async function UtilizadoresPage({ searchParams }: Props) {
  const admin = await isAdmin();
  if (!admin) redirect("/dashboard");

  const [users, currentUser, sp] = await Promise.all([listUsers(), getUser(), searchParams]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestão de Utilizadores</h1>
            <p className="text-slate-500 text-sm">Adicionar, editar roles e remover utilizadores</p>
          </div>
        </div>
        <Link
          href="/utilizadores/novo"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 text-white px-3 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Criar Novo Utilizador
        </Link>
      </div>

      {sp.success && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          Utilizador criado com sucesso!
        </div>
      )}

      <UserList users={users} currentUserId={currentUser?.id ?? ""} />
    </div>
  );
}
