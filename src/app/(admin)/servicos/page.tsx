export const dynamic = "force-dynamic";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ServicoList } from "@/features/servicos/components/ServicoList";
import { findAllServicos } from "@/features/servicos/repository";
import { TENANT_ID } from "@/constants";
import { serializeDecimal } from "@/lib/utils";
import { Plus } from "lucide-react";

export default async function ServicosPage() {
  const raw = await findAllServicos(TENANT_ID);
  const servicos = serializeDecimal(raw);

  return (
    <div>
      <Header title="Serviços" description="Gerencie os serviços oferecidos" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">{servicos.length} serviço{servicos.length !== 1 ? "s" : ""} cadastrado{servicos.length !== 1 ? "s" : ""}</p>
          <Link href="/servicos/novo">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Serviço
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            <ServicoList servicos={servicos} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

