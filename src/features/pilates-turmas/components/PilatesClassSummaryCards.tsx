import { Card, CardContent } from "@/components/ui/card";

interface Props {
  capacity: number;
  schedulesCount: number;
  totalOccupied: number;
  isActive: boolean;
}

export function PilatesClassSummaryCards({ capacity, schedulesCount, totalOccupied, isActive }: Props) {
  const totalSlots = capacity * schedulesCount;
  const available = Math.max(totalSlots - totalOccupied, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
      <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Capacidade</p><p className="text-2xl font-semibold">{capacity}</p></CardContent></Card>
      <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Horários</p><p className="text-2xl font-semibold">{schedulesCount}</p></CardContent></Card>
      <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Ocupação total</p><p className="text-2xl font-semibold">{totalOccupied}/{totalSlots}</p></CardContent></Card>
      <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Vagas livres</p><p className="text-2xl font-semibold text-green-700">{available}</p><p className="text-xs text-gray-500">{isActive ? "Turma ativa" : "Turma inativa"}</p></CardContent></Card>
    </div>
  );
}
