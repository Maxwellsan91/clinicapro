export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { findClienteByIdWithDetails } from "@/features/clientes/repository";
import { ClienteNotes } from "@/features/clientes/components/ClienteNotes";
import { TENANT_ID } from "@/constants";
import { formatDate } from "@/lib/utils";
import { Edit, ArrowLeft, Calendar, CreditCard, User, Phone, Mail, MapPin } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

const statusLabels: Record<string, string> = {
  scheduled: "Agendado",
  completed: "Concluído",
  cancelled: "Cancelado",
  no_show: "Faltou",
};

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-yellow-100 text-yellow-800",
};

const paymentStatusLabels: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  overdue: "Em atraso",
  cancelled: "Cancelado",
};

export default async function ClienteDetailPage({ params }: Props) {
  const { id } = await params;
  const cliente = await findClienteByIdWithDetails(id, TENANT_ID);

  if (!cliente) notFound();

  const totalConsultas = cliente.appointments.length;
  const consultasConcluidas = cliente.appointments.filter((a) => a.status === "completed").length;
  const totalPago = cliente.payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div>
      <Header title={cliente.name} description="Ficha completa do utente" />
      <div className="p-6 space-y-6">
        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/clientes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <Link href={`/clientes/${id}/editar`}>
            <Button size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{totalConsultas}</p>
                <p className="text-xs text-gray-500">Consultas totais</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <User className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{consultasConcluidas}</p>
                <p className="text-xs text-gray-500">Consultas concluídas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{totalPago.toFixed(2)}€</p>
                <p className="text-xs text-gray-500">Total pago</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Info */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem icon={<User className="w-4 h-4" />} label="Nome" value={cliente.name} />
              <InfoItem icon={<Mail className="w-4 h-4" />} label="E-mail" value={cliente.email || "—"} />
              <InfoItem icon={<Phone className="w-4 h-4" />} label="Telefone" value={cliente.phone || "—"} />
              <InfoItem icon={<MapPin className="w-4 h-4" />} label="Endereço" value={cliente.address || "—"} />
              <div className="space-y-1">
                <p className="text-xs text-gray-500">NIF</p>
                <p className="text-sm">{cliente.cpf || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Data de Nascimento</p>
                <p className="text-sm">{cliente.birthDate ? formatDate(cliente.birthDate) : "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Registado em</p>
                <p className="text-sm">{formatDate(cliente.createdAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Notes + History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Observations */}
            <Card>
              <CardContent className="p-6">
                <ClienteNotes clienteId={id} initialNotes={cliente.notes || ""} />
              </CardContent>
            </Card>

            {/* Appointment History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Histórico de Consultas</CardTitle>
              </CardHeader>
              <CardContent>
                {cliente.appointments.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhuma consulta registada.</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {cliente.appointments.map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{apt.service.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(apt.startDateTime)} • {apt.collaborator.name}
                          </p>
                        </div>
                        <Badge className={statusColors[apt.status] || "bg-gray-100 text-gray-800"}>
                          {statusLabels[apt.status] || apt.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Histórico de Pagamentos</CardTitle>
              </CardHeader>
              <CardContent>
                {cliente.payments.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum pagamento registado.</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {cliente.payments.map((pay) => (
                      <div key={pay.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{Number(pay.amount).toFixed(2)}€</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(pay.createdAt)} • {pay.paymentMethod || "—"}
                          </p>
                        </div>
                        <Badge className={pay.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                          {paymentStatusLabels[pay.status] || pay.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-400 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
}
