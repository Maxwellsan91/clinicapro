import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed...");

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
        email: "ana.lima@clinica.pt",
        phone: "+351 912 001 001",
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
        name: "Carlos Sousa",
        email: "carlos.sousa@clinica.pt",
        phone: "+351 912 001 002",
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
        email: "mariana.costa@clinica.pt",
        phone: "+351 912 001 003",
        role: "Massoterapeuta",
        specialty: "Massagem Terapêutica",
      },
    }),
  ]);
  console.log(`✅ Colaboradores: ${colaboradores.length} criados`);

  // Serviços (preços em EUR)
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
        price: 65.0,
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
        description: "Aula de pilates no solo",
        duration: 50,
        price: 45.0,
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
        price: 55.0,
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
        price: 70.0,
        category: "Fisioterapia",
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ Serviços: ${servicos.length} criados`);

  // Clientes com NIF e telefones portugueses
  const clientes = await Promise.all([
    prisma.client.upsert({
      where: { id: "cli-001" },
      update: {},
      create: {
        id: "cli-001",
        tenantId: "tenant-demo",
        name: "João Pereira",
        email: "joao.pereira@email.pt",
        phone: "+351 916 100 001",
        cpf: "123 456 789",
        address: "Rua das Flores, 12, 1200-100 Lisboa",
        notes: "Utente com historial de lombalgias",
      },
    }),
    prisma.client.upsert({
      where: { id: "cli-002" },
      update: {},
      create: {
        id: "cli-002",
        tenantId: "tenant-demo",
        name: "Maria Santos",
        email: "maria.santos@email.pt",
        phone: "+351 916 100 002",
        cpf: "987 654 321",
        address: "Avenida da Liberdade, 45, 4000-200 Porto",
      },
    }),
    prisma.client.upsert({
      where: { id: "cli-003" },
      update: {},
      create: {
        id: "cli-003",
        tenantId: "tenant-demo",
        name: "Pedro Oliveira",
        email: "pedro.oliveira@email.pt",
        phone: "+351 916 100 003",
      },
    }),
  ]);
  console.log(`✅ Clientes: ${clientes.length} criados`);

  // Agendamentos de hoje
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
