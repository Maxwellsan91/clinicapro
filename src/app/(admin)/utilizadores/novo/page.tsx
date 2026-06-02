import Link from "next/link";
import { isAdmin } from "@/features/auth/actions";
import { redirect } from "next/navigation";
import { createUserAction } from "./actions";
import { ArrowLeft } from "lucide-react";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function NovoUtilizadorPage({ searchParams }: Props) {
  const admin = await isAdmin();
  if (!admin) redirect("/dashboard");

  const { error } = await searchParams;

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/utilizadores"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Criar Novo Utilizador</h1>
        <p className="text-slate-500 text-sm mt-1">Preencha os dados para criar uma nova conta.</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={createUserAction} className="space-y-4 rounded-lg border bg-white p-6">
        <div className="space-y-1">
          <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
            Função / Cargo
          </label>
          <input
            id="jobTitle"
            name="jobTitle"
            type="text"
            placeholder="Ex: Fisioterapeuta, Recepcionista, Enfermeiro..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="fisioterapeuta@clinica.pt"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Palavra-passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            id="role"
            name="role"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="user">Utilizador</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Criar Utilizador
          </button>
          <Link
            href="/utilizadores"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

