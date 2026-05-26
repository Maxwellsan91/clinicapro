import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCog, Briefcase, Calendar, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";

const stats = [
  {
    title: "Total de Utentes",
    value: "248",
    description: "+12 este mês",
    icon: Users,
    color: "bg-blue-500",
    bgLight: "bg-blue-50",
    textColor: "text-blue-600",
  },
  {
    title: "Colaboradores",
    value: "18",
    description: "3 especialidades",
    icon: UserCog,
    color: "bg-purple-500",
    bgLight: "bg-purple-50",
    textColor: "text-purple-600",
  },
  {
    title: "Serviços Activos",
    value: "24",
    description: "Fisio, Pilates, Massagem",
    icon: Briefcase,
    color: "bg-green-500",
    bgLight: "bg-green-50",
    textColor: "text-green-600",
  },
  {
    title: "Marcações Hoje",
    value: "32",
    description: "8 confirmadas",
    icon: Calendar,
    color: "bg-orange-500",
    bgLight: "bg-orange-50",
    textColor: "text-orange-600",
  },
];

const recentAppointments = [
  { client: "Ana Silva", service: "Fisioterapia", time: "09:00", status: "confirmed" },
  { client: "Carlos Pereira", service: "Pilates", time: "09:30", status: "scheduled" },
  { client: "Mariana Costa", service: "Massagem Relaxante", time: "10:00", status: "completed" },
  { client: "João Santos", service: "RPG", time: "10:30", status: "confirmed" },
  { client: "Patrícia Lima", service: "Fisioterapia", time: "11:00", status: "no_show" },
];

const statusConfig = {
  confirmed: { label: "Confirmado", color: "bg-blue-100 text-blue-800" },
  scheduled: { label: "Agendado", color: "bg-yellow-100 text-yellow-800" },
  completed: { label: "Concluído", color: "bg-green-100 text-green-800" },
  no_show: { label: "Não compareceu", color: "bg-red-100 text-red-800" },
  cancelled: { label: "Cancelado", color: "bg-gray-100 text-gray-800" },
};

export default function DashboardPage() {
  return (
    <div>
      <Header title="Dashboard" description="Visão geral da sua clínica" />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bgLight}`}>
                      <Icon className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Appointments */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                Próximas Marcações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAppointments.map((apt, i) => {
                  const status = statusConfig[apt.status as keyof typeof statusConfig];
                  return (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">
                          {apt.client.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{apt.client}</p>
                          <p className="text-xs text-gray-500">{apt.service}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600">{apt.time}</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-500" />
                Resumo do Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Concluídos</span>
                  </div>
                  <span className="text-xl font-bold text-green-700">12</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Confirmados</span>
                  </div>
                  <span className="text-xl font-bold text-blue-700">8</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-900">Pendentes</span>
                  </div>
                  <span className="text-xl font-bold text-yellow-700">10</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium text-red-900">Cancelados</span>
                  </div>
                  <span className="text-xl font-bold text-red-700">2</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

