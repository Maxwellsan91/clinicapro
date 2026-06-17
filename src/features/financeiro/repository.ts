import { prisma } from "@/lib/prisma";
import type {
  FinancialCategoryInput,
  FinancialEntryInput,
  SaveMonthInput,
} from "./schema";

const ACTIVE = { isDeleted: false } as const;
const COST_TYPES = ["expense", "tax", "insurance", "investment"] as const;

function monthRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
}

function previousMonth(year: number, month: number) {
  return month === 1
    ? { year: year - 1, month: 12 }
    : { year, month: month - 1 };
}

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

export async function findFinancialCategories(tenantId: string, withDeleted = false) {
  return prisma.financialCategory.findMany({
    where: { tenantId, ...(withDeleted ? {} : ACTIVE) },
    orderBy: [{ group: "asc" }, { order: "asc" }, { name: "asc" }],
  });
}

export async function findActiveFinancialCategories(tenantId: string) {
  return prisma.financialCategory.findMany({
    where: { tenantId, isActive: true, ...ACTIVE },
    orderBy: [{ group: "asc" }, { order: "asc" }, { name: "asc" }],
  });
}

export async function findFinancialCategoryById(id: string, tenantId: string) {
  return prisma.financialCategory.findFirst({ where: { id, tenantId, ...ACTIVE } });
}

export async function createFinancialCategory(tenantId: string, data: FinancialCategoryInput) {
  return prisma.financialCategory.create({
    data: {
      tenantId,
      name: data.name,
      group: data.group,
      type: data.type,
      defaultValue: data.defaultValue ?? null,
      order: data.order ?? 0,
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateFinancialCategory(id: string, tenantId: string, data: FinancialCategoryInput) {
  await prisma.financialCategory.findFirstOrThrow({ where: { id, tenantId, ...ACTIVE } });
  return prisma.financialCategory.update({
    where: { id },
    data: {
      name: data.name,
      group: data.group,
      type: data.type,
      defaultValue: data.defaultValue ?? null,
      order: data.order ?? 0,
      isActive: data.isActive ?? false,
    },
  });
}

export async function deleteFinancialCategory(id: string, tenantId: string) {
  await prisma.financialCategory.findFirstOrThrow({ where: { id, tenantId, ...ACTIVE } });
  return prisma.financialCategory.update({
    where: { id },
    data: { isDeleted: true, isActive: false, deletedAt: new Date() },
  });
}

export async function restoreFinancialCategory(id: string, tenantId: string) {
  await prisma.financialCategory.findFirstOrThrow({ where: { id, tenantId, isDeleted: true } });
  return prisma.financialCategory.update({
    where: { id },
    data: { isDeleted: false, deletedAt: null },
  });
}

export async function getPaidRevenueForMonth(tenantId: string, year: number, month: number) {
  const { start, end } = monthRange(year, month);
  const result = await prisma.payment.aggregate({
    where: {
      tenantId,
      status: "paid",
      isDeleted: false,
      paidAt: { gte: start, lt: end },
    },
    _sum: { amount: true },
  });
  return toNumber(result._sum.amount);
}

export async function getFinancialMonth(tenantId: string, year: number, month: number) {
  const [categories, entries, summary, paidRevenue, previousSummary] = await Promise.all([
    findActiveFinancialCategories(tenantId),
    prisma.financialEntry.findMany({
      where: { tenantId, year, month },
      include: { category: true },
      orderBy: [{ category: { group: "asc" } }, { category: { order: "asc" } }],
    }),
    prisma.financialMonthlySummary.findUnique({
      where: { tenantId_year_month: { tenantId, year, month } },
    }),
    getPaidRevenueForMonth(tenantId, year, month),
    prisma.financialMonthlySummary.findUnique({
      where: {
        tenantId_year_month: {
          tenantId,
          ...previousMonth(year, month),
        },
      },
    }),
  ]);

  const byCategory = new Map(entries.map((entry) => [entry.categoryId, entry]));
  const rows = categories.map((category) => {
    const entry = byCategory.get(category.id);
    return {
      id: entry?.id ?? null,
      categoryId: category.id,
      categoryName: category.name,
      group: category.group,
      type: category.type,
      plannedValue: toNumber(entry?.plannedValue ?? category.defaultValue),
      actualValue: toNumber(entry?.actualValue),
      notes: entry?.notes ?? "",
      order: category.order,
    };
  });

  const manualRevenueAdjustment = toNumber(summary?.manualRevenueAdjustment);
  const savingsAmount = toNumber(summary?.savingsAmount);
  const totalCosts = rows
    .filter((row) => COST_TYPES.includes(row.type as (typeof COST_TYPES)[number]))
    .reduce((total, row) => total + row.actualValue, 0);
  const realizedValue = paidRevenue + manualRevenueAdjustment;
  const finalResult = realizedValue - totalCosts;
  const previousBalance = toNumber(previousSummary?.carriedBalance);
  const carriedBalance = previousBalance + finalResult - savingsAmount;

  return {
    year,
    month,
    rows,
    summary: {
      id: summary?.id ?? null,
      manualRevenueAdjustment,
      savingsAmount,
      notes: summary?.notes ?? "",
      previousBalance,
      paidRevenue,
      realizedValue,
      totalCosts,
      finalResult,
      carriedBalance,
    },
  };
}

export async function saveFinancialMonth(tenantId: string, data: SaveMonthInput) {
  const monthData = await getFinancialMonth(tenantId, data.year, data.month);
  const manualRevenueAdjustment = data.manualRevenueAdjustment ?? 0;
  const savingsAmount = data.savingsAmount ?? 0;
  const totalCosts = data.entries.reduce((total, entry) => {
    const row = monthData.rows.find((item) => item.categoryId === entry.categoryId);
    if (!row || !COST_TYPES.includes(row.type as (typeof COST_TYPES)[number])) return total;
    return total + (entry.actualValue ?? 0);
  }, 0);
  const realizedValue = monthData.summary.paidRevenue + manualRevenueAdjustment;
  const carriedBalance = monthData.summary.previousBalance + realizedValue - totalCosts - savingsAmount;

  return prisma.$transaction(async (tx) => {
    await Promise.all(
      data.entries.map((entry) =>
        tx.financialEntry.upsert({
          where: {
            tenantId_categoryId_year_month: {
              tenantId,
              categoryId: entry.categoryId,
              year: data.year,
              month: data.month,
            },
          },
          update: {
            plannedValue: entry.plannedValue ?? null,
            actualValue: entry.actualValue ?? null,
            notes: entry.notes || null,
          },
          create: {
            tenantId,
            categoryId: entry.categoryId,
            year: data.year,
            month: data.month,
            plannedValue: entry.plannedValue ?? null,
            actualValue: entry.actualValue ?? null,
            notes: entry.notes || null,
          },
        })
      )
    );

    return tx.financialMonthlySummary.upsert({
      where: { tenantId_year_month: { tenantId, year: data.year, month: data.month } },
      update: {
        manualRevenueAdjustment,
        savingsAmount,
        carriedBalance,
        notes: data.notes || null,
      },
      create: {
        tenantId,
        year: data.year,
        month: data.month,
        manualRevenueAdjustment,
        savingsAmount,
        carriedBalance,
        notes: data.notes || null,
      },
    });
  });
}

export async function generateFinancialMonth(tenantId: string, year: number, month: number) {
  const categories = await findActiveFinancialCategories(tenantId);
  return prisma.$transaction(
    categories.map((category) =>
      prisma.financialEntry.upsert({
        where: {
          tenantId_categoryId_year_month: { tenantId, categoryId: category.id, year, month },
        },
        update: {},
        create: {
          tenantId,
          categoryId: category.id,
          year,
          month,
          plannedValue: category.defaultValue ?? null,
          actualValue: null,
        },
      })
    )
  );
}

export async function copyPreviousFinancialMonth(tenantId: string, year: number, month: number) {
  const prev = previousMonth(year, month);
  const previousEntries = await prisma.financialEntry.findMany({
    where: { tenantId, year: prev.year, month: prev.month },
  });

  return prisma.$transaction(
    previousEntries.map((entry) =>
      prisma.financialEntry.upsert({
        where: {
          tenantId_categoryId_year_month: {
            tenantId,
            categoryId: entry.categoryId,
            year,
            month,
          },
        },
        update: {
          plannedValue: entry.plannedValue,
          notes: entry.notes,
        },
        create: {
          tenantId,
          categoryId: entry.categoryId,
          year,
          month,
          plannedValue: entry.plannedValue,
          actualValue: null,
          notes: entry.notes,
        },
      })
    )
  );
}

export async function addAdHocFinancialEntry(tenantId: string, data: FinancialEntryInput) {
  const date = new Date(data.date);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const existing = await prisma.financialEntry.findUnique({
    where: {
      tenantId_categoryId_year_month: {
        tenantId,
        categoryId: data.categoryId,
        year,
        month,
      },
    },
  });

  const actualValue = toNumber(existing?.actualValue) + data.value;
  const description = [existing?.description, data.description].filter(Boolean).join("\n");
  const datedNote = `${date.toLocaleDateString("pt-PT")}: ${data.notes || data.description || "Lançamento avulso"}`;
  const notes = [existing?.notes, datedNote].filter(Boolean).join("\n");

  return prisma.financialEntry.upsert({
    where: {
      tenantId_categoryId_year_month: {
        tenantId,
        categoryId: data.categoryId,
        year,
        month,
      },
    },
    update: {
      actualValue,
      description: description || null,
      notes,
    },
    create: {
      tenantId,
      categoryId: data.categoryId,
      year,
      month,
      actualValue,
      description: data.description || null,
      notes,
    },
  });
}

export async function getFinancialAnnualSummary(tenantId: string, year: number) {
  const categories = await findActiveFinancialCategories(tenantId);
  const entries = await prisma.financialEntry.findMany({
    where: { tenantId, year },
    include: { category: true },
  });
  const entryMap = new Map(entries.map((entry) => [`${entry.categoryId}:${entry.month}`, entry]));
  const rows = categories.map((category) => {
    const months = Array.from({ length: 12 }, (_, index) => {
      const entry = entryMap.get(`${category.id}:${index + 1}`);
      return toNumber(entry?.actualValue);
    });
    return {
      categoryId: category.id,
      categoryName: category.name,
      group: category.group,
      type: category.type,
      months,
      total: months.reduce((total, value) => total + value, 0),
    };
  });
  const monthTotals = Array.from({ length: 12 }, (_, index) =>
    rows.reduce((total, row) => total + row.months[index], 0)
  );

  return {
    year,
    rows,
    monthTotals,
    annualTotal: monthTotals.reduce((total, value) => total + value, 0),
  };
}
