"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, UserCog, Briefcase, Calendar, Activity,
  CreditCard, Percent, ShieldCheck, ClipboardList, Bell, DoorOpen,
  Menu, X, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/features/auth/actions";

const commonNavItems = [
  { href: "/dashboard",     label: "Dashboard",     icon: LayoutDashboard },
  { href: "/clientes",      label: "Utentes",        icon: Users },
  { href: "/colaboradores", label: "Colaboradores",  icon: UserCog },
  { href: "/servicos",      label: "Serviços",        icon: Briefcase },
  { href: "/recursos",      label: "Recursos",        icon: DoorOpen },
  { href: "/agendamentos",  label: "Agendamentos",   icon: Calendar },
];

const adminNavItems = [
  { href: "/pagamentos",   label: "Pagamentos",    icon: CreditCard },
  { href: "/comissoes",    label: "Comissões",      icon: Percent },
  { href: "/utilizadores", label: "Utilizadores",  icon: ShieldCheck },
  { href: "/notificacoes", label: "Notificações",  icon: Bell },
  { href: "/auditoria",    label: "Auditoria",     icon: ClipboardList },
];

// Itens que aparecem na barra inferior (os mais usados)
const bottomItems = [
  { href: "/dashboard",    label: "Início",       icon: LayoutDashboard },
  { href: "/clientes",     label: "Utentes",       icon: Users },
  { href: "/agendamentos", label: "Agenda",        icon: Calendar },
  { href: "/pagamentos",   label: "Pagamentos",   icon: CreditCard },
];

interface MobileNavProps {
  userEmail?: string | null;
  role?: "admin" | "user";
}

export function MobileNav({ userEmail, role = "user" }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = role === "admin";
  const navItems = isAdmin ? [...commonNavItems, ...adminNavItems] : commonNavItems;
  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : "AD";

  // Fechar drawer ao navegar
  useEffect(() => { setOpen(false); }, [pathname]);

  // Bloquear scroll do body quando aberto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── Top bar mobile ─────────────────────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14 bg-slate-900 text-white shadow-md">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight">ClinicaPro</span>
        </div>

        {/* Avatar + hamburguer */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold">
            {initials}
          </div>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Overlay ────────────────────────────────────────────────── */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* ── Drawer lateral esquerdo ────────────────────────────────── */}
      <aside
        className={cn(
          "md:hidden fixed left-0 top-0 z-50 h-full w-72 bg-slate-900 text-white flex flex-col shadow-2xl",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
      >
        {/* Cabeçalho do drawer */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-white">ClinicaPro</p>
              <p className="text-xs text-slate-400">Gestão de Clínica</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu</p>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Rodapé — utilizador + logout */}
        <div className="px-3 py-4 border-t border-slate-700 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-white truncate">
                  {userEmail ? userEmail.split("@")[0] : "Admin"}
                </p>
                {isAdmin && <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
              </div>
              <p className="text-xs text-slate-400">{isAdmin ? "Administrador" : "Utilizador"}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Terminar sessão
            </button>
          </form>
        </div>
      </aside>

      {/* ── Bottom navigation bar ───────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {bottomItems.map(({ href, label, icon: Icon }) => {
            // Pagamentos só para admins
            if (href === "/pagamentos" && !isAdmin) return null;
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full text-xs font-medium transition-colors",
                  isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                <span>{label}</span>
              </Link>
            );
          })}
          {/* Mais — abre o drawer */}
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <Menu className="w-5 h-5" />
            <span>Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
}

