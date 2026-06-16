import { LoginForm } from "@/features/auth/components/LoginForm";
import { Activity, CheckCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar — GlobalFisio",
};

const features = [
  "Gestão completa de utentes e agendamentos",
  "Controlo financeiro e faturas",
  "Dashboard com métricas em tempo real",
  "Multi-colaborador com agenda integrada",
];

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">

      {/* ── Painel esquerdo — branding ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col justify-between p-12 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 overflow-hidden">

        {/* Círculos decorativos */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/4 -right-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute bottom-1/3 -left-10 w-48 h-48 rounded-full bg-indigo-500/30" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">GlobalFisio</span>
        </div>

        {/* Conteúdo central */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <p className="text-blue-200 text-sm font-medium uppercase tracking-widest">
              Plataforma de Gestão
            </p>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              A sua clínica,<br />
              <span className="text-blue-200">organizada.</span>
            </h1>
            <p className="text-blue-100/80 text-lg leading-relaxed max-w-sm">
              Gerencie utentes, agendamentos e pagamentos numa plataforma simples e eficiente.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-blue-100 text-sm">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Rodapé do painel */}
        <div className="relative z-10">
          <p className="text-blue-300/70 text-xs">
            Especializado para fisioterapia, pilates e massagem
          </p>
        </div>
      </div>

      {/* ── Painel direito — formulário ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gray-50">

        {/* Logo mobile */}
        <div className="flex items-center gap-2.5 mb-10 lg:hidden">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-gray-900 font-bold text-lg">GlobalFisio</span>
        </div>

        <div className="w-full max-w-[380px]">

          {/* Cabeçalho */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Bem-vindo de volta
            </h2>
            <p className="text-gray-500 text-sm mt-1.5">
              Introduza as suas credenciais para aceder à plataforma
            </p>
          </div>

          {/* Card do form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <LoginForm />
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-8">
            © {new Date().getFullYear()} GlobalFisio · Todos os direitos reservados
          </p>
        </div>
      </div>

    </div>
  );
}
