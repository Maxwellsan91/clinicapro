"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Briefcase,
  Calendar,
  Activity,
  CreditCard,
  Percent,
  ShieldCheck,
  ClipboardList,
  Bell,
  DoorOpen,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/features/auth/components/LogoutButton";

const commonNavItems = [
  { href: "/dashboard",     label: "Dashboard",      icon: LayoutDashboard },
  { href: "/clientes",      label: "Utentes",         icon: Users },
  { href: "/colaboradores", label: "Colaboradores",   icon: UserCog },
  { href: "/servicos",      label: "Serviços",         icon: Briefcase },
  { href: "/recursos",      label: "Recursos",         icon: DoorOpen },
  { href: "/agendamentos",  label: "Agendamentos",    icon: Calendar },
];

const adminNavItems = [
  { href: "/pagamentos",    label: "Pagamentos",     icon: CreditCard },
  { href: "/comissoes",     label: "Comissões",       icon: Percent },
  { href: "/financeiro",    label: "Financeiro Interno", icon: Landmark },
  { href: "/utilizadores",  label: "Utilizadores",   icon: ShieldCheck },
  { href: "/notificacoes",  label: "Notificações",   icon: Bell },
  { href: "/auditoria",     label: "Auditoria",      icon: ClipboardList },
];

interface SidebarProps {
  userEmail?: string | null;
  role?: "admin" | "user";
}

export function Sidebar({ userEmail, role = "user" }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = role === "admin";

  const navItems = isAdmin ? [...commonNavItems, ...adminNavItems] : commonNavItems;

  const initials = userEmail
    ? userEmail.slice(0, 2).toUpperCase()
    : "AD";

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-sm leading-tight">Clinica<span className="text-blue-400">Pro</span></p>
          <p className="text-slate-400 text-xs">Gestão de Clínica</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu</p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer — utilizador + logout */}
      <div className="px-3 py-4 border-t border-slate-700 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-white truncate">
                {userEmail ? userEmail.split("@")[0] : "Admin"}
              </p>
              {isAdmin && (
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" aria-label="Administrador" />
              )}
            </div>
            <p className="text-xs text-slate-400 truncate">
              {isAdmin ? "Administrador" : "Utilizador"}
            </p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
