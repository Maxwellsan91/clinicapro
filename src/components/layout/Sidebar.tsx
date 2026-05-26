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
  LogOut,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",     label: "Dashboard",     icon: LayoutDashboard },
  { href: "/clientes",      label: "Utentes",        icon: Users },
  { href: "/colaboradores", label: "Colaboradores",  icon: UserCog },
  { href: "/servicos",      label: "Serviços",        icon: Briefcase },
  { href: "/agendamentos",  label: "Agendamentos",   icon: Calendar },
  { href: "/pagamentos",    label: "Pagamentos",     icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-sm leading-tight">ClinicaPro</p>
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

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 text-slate-300 text-xs font-bold">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin</p>
            <p className="text-xs text-slate-400 truncate">admin@clinica.pt</p>
          </div>
          <button className="text-slate-400 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

