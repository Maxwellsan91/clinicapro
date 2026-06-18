export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { TENANT_ID } from "@/constants";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPilatesClasses } from "@/features/pilates-turmas/repository";
import { PilatesClassList } from "@/features/pilates-turmas/components/PilatesClassList";

export default async function PilatesTurmasPage() {
  const classes = await getPilatesClasses(TENANT_ID);

  return (
    <div>
      <Header title="Turmas de Pilates" description="Gestão de horários, alunos inscritos e vagas disponíveis" />
      <div className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500">{classes.length} turma{classes.length !== 1 ? "s" : ""}</p>
          <Link href="/pilates/turmas/novo">
            <Button><Plus className="w-4 h-4" />Nova turma</Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            <PilatesClassList classes={classes} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
