export const dynamic = "force-dynamic";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/features/dashboard/queries";
import { TENANT_ID } from "@/constants";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  UserCog,
  Briefcase,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Euro,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Agendado",        color: "bg-yellow-100 text-yellow-800" },
  completed: { label: "Concluído",        color: "bg-green-100  text-green-800"  },
  cancelled: { label: "Cancelado",        color: "bg-gray-100   text-gray-800"   },
  no_show:   { label: "Não compareceu",  color: "bg-red-100    text-red-800"    },
};

export default async function DashboardPage() {
  const data = await getDashboardData(TENANT_ID);

  const stats = [
    {
      title:       "Total de Utentes",
      value:       data.totalClientes.toString(),
      description: "utentes registados",
      icon:        Users,
      bgLight:     "bg-blue-50",
      textColor:   "text-blue-600",
      href:        "/clientes",
    },
    {
      title:       "Colaboradores",
      value:       data.totalColaboradores.toString(),
      description: "na equipa",
      icon:        UserCog,
      bgLight:     "bg-purple-50",
      textColor:   "text-purple-600",
      href:        "/colaboradores",
    },
    {
      title:       "Serviços Activos",
      value:       data.totalServicosAtivos.toString(),
      description: "disponíveis",
      icon:        Briefcase,
      bgLight:     "bg-green-50",
      textColor:   "text-green-600",
      href:        "/servicos",
    },
    {
      title:       "Marcações Hoje",
      value:       data.agendamentosHoje.toString(),
      description: `${data.agendamentosHojePorStatus.completed} concluídas`,
      icon:        Calendar,
      bgLight:     "bg-orange-50",
      textColor:   "text-orange-600",
      href:        "/agendamentos",
    },
    {
      title:       "Pagamentos Pendentes",
      value:       data.pagamentosPendentes.count.toString(),
      description: formatCurrency(data.pagamentosPendentes.total),
      icon:        AlertCircle,
      bgLight:     "bg-yellow-50",
      textColor:   "text-yellow-600",
      href:        "/pagamentos?status=pending",
    },
    {
      title:       "Recebido Este Mês",
      value:       formatCurrency(data.recebidoMes.total),
      description: `${data.recebidoMes.count} pagamentos`,
      icon:        Euro,
      bgLight:     "bg-emerald-50",
      textColor:   "text-emerald-600",
      href:        "/pagamentos?status=paid",
    },
  ];

  const resumoDia = [
    {
      label: "Concluídas",
      count: data.agendamentosHojePorStatus.completed,
      icon:  CheckCircle,
      bg:    "bg-green-50",
      text:  "text-green-600",
      bold:  "text-green-700",
    },
    {
      label: "Agendadas",
      count: data.agendamentosHojePorStatus.scheduled,
      icon:  Clock,
      bg:    "bg-yellow-50",
      text:  "text-yellow-600",
      bold:  "text-yellow-700",
    },
    {
      label: "Canceladas",
      count: data.agendamentosHojePorStatus.cancelled,
      icon:  XCircle,
      bg:    "bg-gray-50",
      text:  "text-gray-500",
      bold:  "text-gray-700",
    },
    {
      label: "Não compareceu",
      count: data.agendamentosHojePorStatus.no_show,
      icon:  XCircle,
      bg:    "bg-red-50",
      text:  "text-red-500",
      bold:  "text-red-700",
    },
  ];

  return (
    <div>
      <Header title="Dashboard" description="Visão geral da sua clínica" />

      <div className="p-6 space-y-6">

        {/* ── Cards principais ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link href={stat.href} key={stat.title} className="group">
                <Card className="transition-shadow hover:shadow-md cursor-pointer h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 mt-1 leading-tight">
                          {stat.value}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{stat.description}</p>
                      </div>
                      <div className={`p-2.5 rounded-xl ${stat.bgLight} shrink-0 ml-3`}>
                        <Icon className={`w-5 h-5 ${stat.textColor}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* ── Linha inferior ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Próximas Marcações */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-4 h-4 text-gray-500" />
                Próximas Marcações
              </CardTitle>
              <Link
                href="/agendamentos"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                Ver todas <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              {data.proximasMarcocoes.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Sem marcações futuras</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {data.proximasMarcocoes.map((apt) => {
                    const statusInfo = STATUS_CONFIG[apt.status] ?? {
                      label: apt.status,
                      color: "bg-gray-100 text-gray-700",
                    };
                    const hora = new Intl.DateTimeFormat("pt-PT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(apt.startDateTime));
                    const dia = new Intl.DateTimeFormat("pt-PT", {
                      day: "2-digit",
                      month: "2-digit",
                    }).format(new Date(apt.startDateTime));
                    const initials = apt.client.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between py-2.5 px-1 border-b border-gray-50 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {apt.client.name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {apt.service.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-700">
                              {hora}
                            </p>
                            <p className="text-xs text-gray-400">{dia}</p>
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumo do Dia */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                Resumo de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {/* Total do dia em destaque */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Total hoje</span>
                </div>
                <span className="text-xl font-bold text-blue-700">
                  {data.agendamentosHoje}
                </span>
              </div>

              {resumoDia.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between p-3 ${item.bg} rounded-lg`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${item.text}`} />
                      <span className={`text-sm font-medium ${item.text.replace("500", "900").replace("600", "900")}`}>
                        {item.label}
                      </span>
                    </div>
                    <span className={`text-lg font-bold ${item.bold}`}>
                      {item.count}
                    </span>
                  </div>
                );
              })}

              {/* Separador financeiro */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Euro className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-900">Mês actual</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-700">
                    {formatCurrency(data.recebidoMes.total)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-900">A receber</span>
                  </div>
                  <span className="text-sm font-bold text-yellow-700">
                    {formatCurrency(data.pagamentosPendentes.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
