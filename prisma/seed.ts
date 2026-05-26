import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed...");

  // Tenant já criado via SQL, apenas garantir que existe
  const tenant = await prisma.tenant.upsert({
    where: { id: "tenant-demo" },
    update: {},
    create: {
      id: "tenant-demo",
      name: "Clínica Demo",
      slug: "clinica-demo",
    },
  });
  console.log(`✅ Tenant: ${tenant.name}`);

  // Colaboradores
  const colaboradores = await Promise.all([
    prisma.collaborator.upsert({
      where: { id: "col-001" },
      update: {},
      create: {
        id: "col-001",
        tenantId: "tenant-demo",
        name: "Dra. Ana Lima",
        email: "ana.lima@clinica.com",
        phone: "(11) 99001-0001",
        role: "Fisioterapeuta",
        specialty: "Fisioterapia Ortopédica",
      },
    }),
    prisma.collaborator.upsert({
      where: { id: "col-002" },
      update: {},
      create: {
        id: "col-002",
        tenantId: "tenant-demo",
        name: "Carlos Souza",
        email: "carlos.souza@clinica.com",
        phone: "(11) 99001-0002",
        role: "Instrutor de Pilates",
        specialty: "Pilates Clínico",
      },
    }),
    prisma.collaborator.upsert({
      where: { id: "col-003" },
      update: {},
      create: {
        id: "col-003",
        tenantId: "tenant-demo",
        name: "Mariana Costa",
        email: "mariana.costa@clinica.com",
        phone: "(11) 99001-0003",
        role: "Massoterapeuta",
        specialty: "Massagem Terapêutica",
      },
    }),
  ]);
  console.log(`✅ Colaboradores: ${colaboradores.length} criados`);

  // Serviços
  const servicos = await Promise.all([
    prisma.service.upsert({
      where: { id: "svc-001" },
      update: {},
      create: {
        id: "svc-001",
        tenantId: "tenant-demo",
        name: "Fisioterapia Ortopédica",
        description: "Tratamento de lesões musculoesqueléticas",
        duration: 60,
        price: 180.0,
        category: "Fisioterapia",
        isActive: true,
      },
    }),
    prisma.service.upsert({
      where: { id: "svc-002" },
      update: {},
      create: {
        id: "svc-002",
        tenantId: "tenant-demo",
        name: "Pilates Solo",
        description: "Aula de pilates no solo com colchonete",
        duration: 50,
        price: 120.0,
        category: "Pilates",
        isActive: true,
      },
    }),
    prisma.service.upsert({
      where: { id: "svc-003" },
      update: {},
      create: {
        id: "svc-003",
        tenantId: "tenant-demo",
        name: "Massagem Relaxante",
        description: "Massagem corporal relaxante 60 minutos",
        duration: 60,
        price: 150.0,
        category: "Massagem",
        isActive: true,
      },
    }),
    prisma.service.upsert({
      where: { id: "svc-004" },
      update: {},
      create: {
        id: "svc-004",
        tenantId: "tenant-demo",
        name: "RPG",
        description: "Reeducação Postural Global",
        duration: 60,
        price: 200.0,
        category: "Fisioterapia",
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ Serviços: ${servicos.length} criados`);

  // Clientes
  const clientes = await Promise.all([
    prisma.client.upsert({
      where: { id: "cli-001" },
      update: {},
      create: {
        id: "cli-001",
        tenantId: "tenant-demo",
        name: "João Pereira",
        email: "joao.pereira@email.com",
        phone: "(11) 98000-1001",
        cpf: "123.456.789-00",
        notes: "Paciente com histórico de lombalgia",
      },
    }),
    prisma.client.upsert({
      where: { id: "cli-002" },
      update: {},
      create: {
        id: "cli-002",
        tenantId: "tenant-demo",
        name: "Maria Santos",
        email: "maria.santos@email.com",
        phone: "(11) 98000-1002",
        cpf: "987.654.321-00",
      },
    }),
    prisma.client.upsert({
      where: { id: "cli-003" },
      update: {},
      create: {
        id: "cli-003",
        tenantId: "tenant-demo",
        name: "Pedro Oliveira",
        email: "pedro.oliveira@email.com",
        phone: "(11) 98000-1003",
      },
    }),
  ]);
  console.log(`✅ Clientes: ${clientes.length} criados`);

  // Agendamentos de exemplo para hoje
  const hoje = new Date();
  const agendamentos = await Promise.all([
    prisma.appointment.upsert({
      where: { id: "apt-001" },
      update: {},
      create: {
        id: "apt-001",
        tenantId: "tenant-demo",
        clientId: "cli-001",
        collaboratorId: "col-001",
        serviceId: "svc-001",
        startDateTime: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 9, 0),
        endDateTime: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 10, 0),
        status: "scheduled",
        notes: "Primeira sessão de avaliação",
      },
    }),
    prisma.appointment.upsert({
      where: { id: "apt-002" },
      update: {},
      create: {
        id: "apt-002",
        tenantId: "tenant-demo",
        clientId: "cli-002",
        collaboratorId: "col-002",
        serviceId: "svc-002",
        startDateTime: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 10, 0),
        endDateTime: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 10, 50),
        status: "completed",
      },
    }),
    prisma.appointment.upsert({
      where: { id: "apt-003" },
      update: {},
      create: {
        id: "apt-003",
        tenantId: "tenant-demo",
        clientId: "cli-003",
        collaboratorId: "col-003",
        serviceId: "svc-003",
        startDateTime: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 14, 0),
        endDateTime: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 15, 0),
        status: "scheduled",
      },
    }),
  ]);
  console.log(`✅ Agendamentos: ${agendamentos.length} criados`);

  console.log("\n🎉 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

