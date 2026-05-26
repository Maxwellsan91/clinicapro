import { LoginForm } from "@/features/auth/components/LoginForm";
import { Activity } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar — ClinicaPro",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Header do card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-7 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 mx-auto mb-4">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">ClinicaPro</h1>
            <p className="text-blue-200 text-sm mt-1">Gestão de Clínica</p>
          </div>

          {/* Corpo do card */}
          <div className="px-8 py-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Bem-vindo</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Introduza as suas credenciais para entrar
              </p>
            </div>

            <LoginForm />
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          © {new Date().getFullYear()} ClinicaPro · Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}

