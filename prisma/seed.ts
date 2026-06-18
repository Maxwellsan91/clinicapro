import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// ─── Helpers ────────────────────────────────────────────────────────────────

function daysFromNow(days: number, hour = 9, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function daysAgo(days: number, hour = 10, minute = 0) {
  return daysFromNow(-days, hour, minute);
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

// ─── IDs fixos ──────────────────────────────────────────────────────────────

const TENANT_ID = "tenant-demo";

const IDS = {
  // clientes
  cli1: "cli-seed-001", cli2: "cli-seed-002", cli3: "cli-seed-003",
  cli4: "cli-seed-004", cli5: "cli-seed-005",
  // colaboradores
  col1: "col-seed-001", col2: "col-seed-002", col3: "col-seed-003",
  // serviços
  svc1: "svc-seed-001", svc2: "svc-seed-002", svc3: "svc-seed-003",
  svc4: "svc-seed-004", svc5: "svc-seed-005",
  // recursos
  res1: "res-seed-001", res2: "res-seed-002", res3: "res-seed-003",
  res4: "res-seed-004", res5: "res-seed-005", res6: "res-seed-006",
  // turmas pilates
  pil1: "pil-seed-001", pil2: "pil-seed-002", pil3: "pil-seed-003",
  pil4: "pil-seed-004", pil5: "pil-seed-005",
  // agendamentos
  apt1: "apt-seed-001", apt2: "apt-seed-002", apt3: "apt-seed-003",
  apt4: "apt-seed-004", apt5: "apt-seed-005", apt6: "apt-seed-006",
  apt7: "apt-seed-007", apt8: "apt-seed-008",
  // pagamentos
  pay1: "pay-seed-001", pay2: "pay-seed-002", pay3: "pay-seed-003",
  pay4: "pay-seed-004", pay5: "pay-seed-005", pay6: "pay-seed-006",
  pay7: "pay-seed-007",
};

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱  A iniciar seed...\n");

  // ── 1. Tenant ──────────────────────────────────────────────────────────────
  await prisma.tenant.upsert({
    where:  { id: TENANT_ID },
    update: { name: "Clínica Demo", slug: "clinica-demo" },
    create: { id: TENANT_ID, name: "Clínica Demo", slug: "clinica-demo" },
  });
  console.log("✅  Tenant: Clínica Demo");

  // ── 2. Colaboradores ───────────────────────────────────────────────────────
  await Promise.all([
    prisma.collaborator.upsert({
      where: { id: IDS.col1 }, update: {},
      create: {
        id: IDS.col1, tenantId: TENANT_ID,
        name: "Dra. Ana Lima", email: "ana.lima@clinica.pt",
        phone: "+351 912 001 001", role: "Fisioterapeuta",
        specialty: "Fisioterapia Ortopédica",
      },
    }),
    prisma.collaborator.upsert({
      where: { id: IDS.col2 }, update: {},
      create: {
        id: IDS.col2, tenantId: TENANT_ID,
        name: "Carlos Sousa", email: "carlos.sousa@clinica.pt",
        phone: "+351 912 001 002", role: "Instrutor de Pilates",
        specialty: "Pilates Clínico",
      },
    }),
    prisma.collaborator.upsert({
      where: { id: IDS.col3 }, update: {},
      create: {
        id: IDS.col3, tenantId: TENANT_ID,
        name: "Mariana Costa", email: "mariana.costa@clinica.pt",
        phone: "+351 912 001 003", role: "Massoterapeuta",
        specialty: "Massagem Terapêutica e Desportiva",
      },
    }),
  ]);
  console.log("✅  3 colaboradores criados");

  // ── 3. Serviços ────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.service.upsert({
      where: { id: IDS.svc1 }, update: {},
      create: {
        id: IDS.svc1, tenantId: TENANT_ID,
        name: "Fisioterapia Ortopédica",
        description: "Avaliação e tratamento de lesões musculoesqueléticas",
        duration: 60, price: 65.00, category: "Fisioterapia", isActive: true,
      },
    }),
    prisma.service.upsert({
      where: { id: IDS.svc2 }, update: {},
      create: {
        id: IDS.svc2, tenantId: TENANT_ID,
        name: "Pilates Solo",
        description: "Aula individual de pilates no solo",
        duration: 50, price: 45.00, category: "Pilates", isActive: true,
      },
    }),
    prisma.service.upsert({
      where: { id: IDS.svc3 }, update: {},
      create: {
        id: IDS.svc3, tenantId: TENANT_ID,
        name: "Massagem Relaxante",
        description: "Massagem corporal relaxante — 60 minutos",
        duration: 60, price: 55.00, category: "Massagem", isActive: true,
      },
    }),
    prisma.service.upsert({
      where: { id: IDS.svc4 }, update: {},
      create: {
        id: IDS.svc4, tenantId: TENANT_ID,
        name: "RPG",
        description: "Reeducação Postural Global",
        duration: 60, price: 70.00, category: "Fisioterapia", isActive: true,
      },
    }),
    prisma.service.upsert({
      where: { id: IDS.svc5 }, update: {},
      create: {
        id: IDS.svc5, tenantId: TENANT_ID,
        name: "Pilates Aparelhos",
        description: "Sessão individual em aparelhos de pilates",
        duration: 55, price: 60.00, category: "Pilates", isActive: true,
      },
    }),
  ]);
  console.log("✅  5 serviços criados");

  // ── 4. Recursos ────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.resource.upsert({
      where: { id: IDS.res1 }, update: {},
      create: {
        id: IDS.res1, tenantId: TENANT_ID,
        name: "Fisio 1", type: "room", capacity: 1, isActive: true,
      },
    }),
    prisma.resource.upsert({
      where: { id: IDS.res2 }, update: {},
      create: {
        id: IDS.res2, tenantId: TENANT_ID,
        name: "Fisio 2", type: "room", capacity: 1, isActive: true,
      },
    }),
    prisma.resource.upsert({
      where: { id: IDS.res3 }, update: {},
      create: {
        id: IDS.res3, tenantId: TENANT_ID,
        name: "Terapia Ocupacional", type: "room", capacity: 2, isActive: true,
      },
    }),
    prisma.resource.upsert({
      where: { id: IDS.res4 }, update: {},
      create: {
        id: IDS.res4, tenantId: TENANT_ID,
        name: "Psicologia", type: "room", capacity: 1, isActive: true,
      },
    }),
    prisma.resource.upsert({
      where: { id: IDS.res5 }, update: {},
      create: {
        id: IDS.res5, tenantId: TENANT_ID,
        name: "Ginásio", type: "gym", capacity: 10, isActive: true,
      },
    }),
    prisma.resource.upsert({
      where: { id: IDS.res6 }, update: {},
      create: {
        id: IDS.res6, tenantId: TENANT_ID,
        name: "Terapia da Fala", type: "room", capacity: 1, isActive: true,
      },
    }),
  ]);
  console.log("✅  6 recursos criados (salas + ginásio)");

  // ── 4.1. Turmas de Pilates ────────────────────────────────────────────────
  const pilatesSeeds = [
    { id: IDS.pil1, name: "Turma 1", capacity: 13, schedules: [[1, "19:15"], [4, "19:15"]] },
    { id: IDS.pil2, name: "Turma 2", capacity: 10, schedules: [[2, "10:15"], [4, "10:15"]] },
    { id: IDS.pil3, name: "Turma 3", capacity: 10, schedules: [[2, "11:15"], [4, "11:15"]] },
    { id: IDS.pil4, name: "Turma 4", capacity: 10, schedules: [[2, "18:15"], [4, "18:15"]] },
    { id: IDS.pil5, name: "Turma 5", capacity: 10, schedules: [[3, "18:15"], [5, "18:15"]] },
  ] as const;

  for (const turma of pilatesSeeds) {
    await prisma.pilatesClass.upsert({
      where: { id: turma.id },
      update: {
        name: turma.name,
        capacity: turma.capacity,
        serviceId: IDS.svc2,
        collaboratorId: IDS.col2,
        resourceId: IDS.res5,
        isActive: true,
      },
      create: {
        id: turma.id,
        tenantId: TENANT_ID,
        name: turma.name,
        capacity: turma.capacity,
        serviceId: IDS.svc2,
        collaboratorId: IDS.col2,
        resourceId: IDS.res5,
        isActive: true,
        notes: "Turma demo criada pelo seed. Pode ser alterada pelo administrador.",
      },
    });

    for (const [dayOfWeek, startTime] of turma.schedules) {
      await prisma.pilatesClassSchedule.upsert({
        where: {
          classId_dayOfWeek_startTime: {
            classId: turma.id,
            dayOfWeek,
            startTime,
          },
        },
        update: { duration: 50 },
        create: {
          tenantId: TENANT_ID,
          classId: turma.id,
          dayOfWeek,
          startTime,
          duration: 50,
        },
      });
    }
  }
  console.log("✅  5 turmas de Pilates demo criadas");

  // ── 5. Clientes ────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.client.upsert({
      where: { id: IDS.cli1 }, update: {},
      create: {
        id: IDS.cli1, tenantId: TENANT_ID,
        name: "João Pereira", email: "joao.pereira@email.pt",
        phone: "+351 916 100 001", cpf: "123 456 789",
        birthDate: new Date("1985-03-14"),
        address: "Rua das Flores, 12, 1200-100 Lisboa",
        notes: "Utente com historial de lombalgias. Prefere sessões de manhã.",
      },
    }),
    prisma.client.upsert({
      where: { id: IDS.cli2 }, update: {},
      create: {
        id: IDS.cli2, tenantId: TENANT_ID,
        name: "Maria Santos", email: "maria.santos@email.pt",
        phone: "+351 916 100 002", cpf: "987 654 321",
        birthDate: new Date("1990-07-22"),
        address: "Avenida da Liberdade, 45, 4000-200 Porto",
      },
    }),
    prisma.client.upsert({
      where: { id: IDS.cli3 }, update: {},
      create: {
        id: IDS.cli3, tenantId: TENANT_ID,
        name: "Pedro Oliveira", email: "pedro.oliveira@email.pt",
        phone: "+351 916 100 003", cpf: "456 789 123",
        birthDate: new Date("1978-11-05"),
        address: "Rua do Almada, 88, 4050-036 Porto",
        notes: "Pratica desporto regularmente. Lesão no ombro direito.",
      },
    }),
    prisma.client.upsert({
      where: { id: IDS.cli4 }, update: {},
      create: {
        id: IDS.cli4, tenantId: TENANT_ID,
        name: "Carla Fernandes", email: "carla.fernandes@email.pt",
        phone: "+351 916 100 004", cpf: "321 654 987",
        birthDate: new Date("1995-01-30"),
        address: "Travessa da Paz, 7, 1100-300 Lisboa",
      },
    }),
    prisma.client.upsert({
      where: { id: IDS.cli5 }, update: {},
      create: {
        id: IDS.cli5, tenantId: TENANT_ID,
        name: "Rui Matos", email: "rui.matos@email.pt",
        phone: "+351 916 100 005", cpf: "654 987 321",
        birthDate: new Date("1970-09-18"),
        address: "Rua de Santa Catarina, 200, 4000-450 Porto",
        notes: "Utente sénior. Tratamento pós-cirúrgico do joelho.",
      },
    }),
  ]);
  console.log("✅  5 clientes criados");

  // ── 6. Agendamentos ────────────────────────────────────────────────────────
  // Datas — passados
  const s1 = daysAgo(5, 9, 0);
  const s2 = daysAgo(3, 10, 30);
  const s3 = daysAgo(2, 14, 0);
  const s4 = daysAgo(1, 9, 0);
  const s5 = daysAgo(1, 11, 0);
  // Datas — hoje e futuros
  const s6 = daysFromNow(0, 9, 0);
  const s7 = daysFromNow(1, 10, 0);
  const s8 = daysFromNow(3, 15, 0);

  await Promise.all([
    prisma.appointment.upsert({
      where: { id: IDS.apt1 }, update: {},
      create: {
        id: IDS.apt1, tenantId: TENANT_ID,
        clientId: IDS.cli1, collaboratorId: IDS.col1, serviceId: IDS.svc1,
        startDateTime: s1, endDateTime: addMinutes(s1, 60),
        status: "completed", notes: "Primeira sessão de avaliação ortopédica.",
      },
    }),
    prisma.appointment.upsert({
      where: { id: IDS.apt2 }, update: {},
      create: {
        id: IDS.apt2, tenantId: TENANT_ID,
        clientId: IDS.cli2, collaboratorId: IDS.col2, serviceId: IDS.svc2,
        startDateTime: s2, endDateTime: addMinutes(s2, 50),
        status: "completed",
      },
    }),
    prisma.appointment.upsert({
      where: { id: IDS.apt3 }, update: {},
      create: {
        id: IDS.apt3, tenantId: TENANT_ID,
        clientId: IDS.cli3, collaboratorId: IDS.col3, serviceId: IDS.svc3,
        startDateTime: s3, endDateTime: addMinutes(s3, 60),
        status: "no_show", notes: "Utente não compareceu sem aviso.",
      },
    }),
    prisma.appointment.upsert({
      where: { id: IDS.apt4 }, update: {},
      create: {
        id: IDS.apt4, tenantId: TENANT_ID,
        clientId: IDS.cli4, collaboratorId: IDS.col1, serviceId: IDS.svc4,
        startDateTime: s4, endDateTime: addMinutes(s4, 60),
        status: "completed",
      },
    }),
    prisma.appointment.upsert({
      where: { id: IDS.apt5 }, update: {},
      create: {
        id: IDS.apt5, tenantId: TENANT_ID,
        clientId: IDS.cli5, collaboratorId: IDS.col2, serviceId: IDS.svc5,
        startDateTime: s5, endDateTime: addMinutes(s5, 55),
        status: "cancelled", notes: "Cancelado pelo utente com 2h de antecedência.",
      },
    }),
    prisma.appointment.upsert({
      where: { id: IDS.apt6 }, update: {},
      create: {
        id: IDS.apt6, tenantId: TENANT_ID,
        clientId: IDS.cli1, collaboratorId: IDS.col1, serviceId: IDS.svc1,
        startDateTime: s6, endDateTime: addMinutes(s6, 60),
        status: "scheduled", notes: "Segunda sessão de fisioterapia.",
      },
    }),
    prisma.appointment.upsert({
      where: { id: IDS.apt7 }, update: {},
      create: {
        id: IDS.apt7, tenantId: TENANT_ID,
        clientId: IDS.cli2, collaboratorId: IDS.col2, serviceId: IDS.svc2,
        startDateTime: s7, endDateTime: addMinutes(s7, 50),
        status: "scheduled",
      },
    }),
    prisma.appointment.upsert({
      where: { id: IDS.apt8 }, update: {},
      create: {
        id: IDS.apt8, tenantId: TENANT_ID,
        clientId: IDS.cli3, collaboratorId: IDS.col3, serviceId: IDS.svc3,
        startDateTime: s8, endDateTime: addMinutes(s8, 60),
        status: "scheduled",
      },
    }),
  ]);
  console.log("✅  8 agendamentos criados (5 passados + 3 futuros)");

  // ── 7. Pagamentos ──────────────────────────────────────────────────────────
  await Promise.all([
    // Pago — apt1
    prisma.payment.upsert({
      where: { id: IDS.pay1 }, update: {},
      create: {
        id: IDS.pay1, tenantId: TENANT_ID,
        clientId: IDS.cli1, appointmentId: IDS.apt1,
        amount: 65.00, paymentMethod: "Multibanco",
        status: "paid", paidAt: daysAgo(5, 9, 30),
        invoiceStatus: "issued", invoiceNumber: "FT 2026/001",
        notes: "Pago no balcão após a sessão.",
      },
    }),
    // Pago — apt2
    prisma.payment.upsert({
      where: { id: IDS.pay2 }, update: {},
      create: {
        id: IDS.pay2, tenantId: TENANT_ID,
        clientId: IDS.cli2, appointmentId: IDS.apt2,
        amount: 45.00, paymentMethod: "MBWay",
        status: "paid", paidAt: daysAgo(3, 11, 0),
        invoiceStatus: "issued", invoiceNumber: "FT 2026/002",
      },
    }),
    // Pago — apt4
    prisma.payment.upsert({
      where: { id: IDS.pay3 }, update: {},
      create: {
        id: IDS.pay3, tenantId: TENANT_ID,
        clientId: IDS.cli4, appointmentId: IDS.apt4,
        amount: 70.00, paymentMethod: "Transferência Bancária",
        status: "paid", paidAt: daysAgo(1, 9, 30),
        invoiceStatus: "issued", invoiceNumber: "FT 2026/003",
      },
    }),
    // Pendente — apt6 (hoje)
    prisma.payment.upsert({
      where: { id: IDS.pay4 }, update: {},
      create: {
        id: IDS.pay4, tenantId: TENANT_ID,
        clientId: IDS.cli1, appointmentId: IDS.apt6,
        amount: 65.00, status: "pending",
        dueDate: daysFromNow(0, 23, 59),
        invoiceStatus: "not_issued",
        notes: "Aguarda pagamento após sessão de hoje.",
      },
    }),
    // Pendente — apt7 (amanhã)
    prisma.payment.upsert({
      where: { id: IDS.pay5 }, update: {},
      create: {
        id: IDS.pay5, tenantId: TENANT_ID,
        clientId: IDS.cli2, appointmentId: IDS.apt7,
        amount: 45.00, status: "pending",
        dueDate: daysFromNow(1, 23, 59),
        invoiceStatus: "not_issued",
      },
    }),
    // Parcial — pack de sessões avulso
    prisma.payment.upsert({
      where: { id: IDS.pay6 }, update: {},
      create: {
        id: IDS.pay6, tenantId: TENANT_ID,
        clientId: IDS.cli3,
        amount: 120.00, paymentMethod: "Numerário",
        status: "partial", paidAt: daysAgo(2, 15, 0),
        dueDate: daysFromNow(7, 23, 59),
        invoiceStatus: "not_issued",
        notes: "Pack 3 sessões — pago 1.ª prestação (€40). Restam €80.",
      },
    }),
    // Pendente vencido — alerta no dashboard
    prisma.payment.upsert({
      where: { id: IDS.pay7 }, update: {},
      create: {
        id: IDS.pay7, tenantId: TENANT_ID,
        clientId: IDS.cli5,
        amount: 55.00, status: "pending",
        dueDate: daysAgo(3, 23, 59),
        invoiceStatus: "not_issued",
        notes: "Pagamento em atraso — contactar utente.",
      },
    }),
  ]);
  console.log("✅  7 pagamentos criados (3 pagos · 3 pendentes · 1 parcial)");

  // ── 9. Categorias Financeiras Internas ────────────────────────────────────
  const financialCategories = [
    ["Vencimento Pedro", "Pessoal", "expense", "personnel_cost"],
    ["Vencimento Rodrigo", "Pessoal", "expense", "personnel_cost"],
    ["Despesas de Deslocações", "Despesas Variáveis", "expense", "operational_expense"],
    ["Vencimento Bruna", "Pessoal", "expense", "personnel_cost"],
    ["Vencimento Maria", "Pessoal", "expense", "personnel_cost"],
    ["Renda", "Despesas Fixas", "expense", "operational_expense"],
    ["Contabilista", "Despesas Fixas", "expense", "operational_expense"],
    ["Água", "Despesas Fixas", "expense", "operational_expense"],
    ["Luz", "Despesas Fixas", "expense", "operational_expense"],
    ["Vodafone", "Despesas Fixas", "expense", "operational_expense"],
    ["Comissões CGD", "Despesas Fixas", "expense", "operational_expense"],
    ["Fisiocreme", "Despesas Variáveis", "expense", "operational_expense"],
    ["Exaclean", "Despesas Variáveis", "expense", "operational_expense"],
    ["Diversos", "Despesas Variáveis", "expense", "operational_expense"],
    ["Crédito Obras", "Investimento", "investment", "investment"],
    ["Zappy", "Despesas Variáveis", "expense", "operational_expense"],
    ["ProSegur", "Despesas Fixas", "expense", "operational_expense"],
    ["Técnicas", "Pessoal", "expense", "personnel_cost"],
    ["Recepção", "Pessoal", "expense", "personnel_cost"],
    ["Gasóleo", "Despesas Variáveis", "expense", "operational_expense"],
    ["IRC / Pagamentos por Conta", "Impostos e Contribuições", "tax", "tax"],
    ["Seguro x12", "Seguros", "insurance", "insurance"],
    ["Seg. Acid. Trabalho x12", "Seguros", "insurance", "insurance"],
    ["ERS x12", "Impostos e Contribuições", "tax", "tax"],
    ["TOC online x12", "Impostos e Contribuições", "tax", "tax"],
    ["Poupança para Formação", "Poupança e Reservas", "savings", "saving_reserve"],
    ["Poupança Subsídio Férias + Natal", "Poupança e Reservas", "savings", "saving_reserve"],
    ["Investimento / Liquidar Crédito", "Investimento", "investment", "investment"],
    ["Reserva", "Poupança e Reservas", "savings", "saving_reserve"],
    ["Poupança Mensal", "Poupança e Reservas", "savings", "saving_reserve"],
  ] as const;

  await Promise.all(
    financialCategories.map(([name, group, type, calculationType], index) =>
      prisma.financialCategory.upsert({
        where: { id: `fin-cat-seed-${String(index + 1).padStart(3, "0")}` },
        update: { name, group, type, calculationType, order: index + 1, isActive: true, isDeleted: false, deletedAt: null },
        create: {
          id: `fin-cat-seed-${String(index + 1).padStart(3, "0")}`,
          tenantId: TENANT_ID,
          name,
          group,
          type,
          calculationType,
          order: index + 1,
          isActive: true,
        },
      })
    )
  );
  console.log("✅  30 categorias financeiras internas criadas");

  // ── Resumo final ───────────────────────────────────────────────────────────
  const [nTen, nCol, nSvc, nCli, nApt, nPay, nRes, nFinCat] = await Promise.all([
    prisma.tenant.count(),
    prisma.collaborator.count({ where: { tenantId: TENANT_ID } }),
    prisma.service.count({ where: { tenantId: TENANT_ID } }),
    prisma.client.count({ where: { tenantId: TENANT_ID } }),
    prisma.appointment.count({ where: { tenantId: TENANT_ID } }),
    prisma.payment.count({ where: { tenantId: TENANT_ID } }),
    prisma.resource.count({ where: { tenantId: TENANT_ID } }),
    prisma.financialCategory.count({ where: { tenantId: TENANT_ID } }),
  ]);

  console.log(`
────────────────────────────────
🎉  Seed concluído com sucesso!
────────────────────────────────
  Tenants       : ${nTen}
  Colaboradores : ${nCol}
  Serviços      : ${nSvc}
  Recursos      : ${nRes}
  Clientes      : ${nCli}
  Agendamentos  : ${nApt}
  Pagamentos    : ${nPay}
  Financeiro    : ${nFinCat} categorias
────────────────────────────────`);
}

main()
  .catch((e) => { console.error("❌  Erro no seed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
