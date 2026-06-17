-- CreateTable
CREATE TABLE "FinancialCategory" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "defaultValue" DECIMAL(10,2),
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "plannedValue" DECIMAL(10,2),
    "actualValue" DECIMAL(10,2),
    "description" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialMonthlySummary" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "manualRevenueAdjustment" DECIMAL(10,2),
    "savingsAmount" DECIMAL(10,2),
    "carriedBalance" DECIMAL(10,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialMonthlySummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinancialCategory_tenantId_idx" ON "FinancialCategory"("tenantId");
CREATE INDEX "FinancialCategory_group_idx" ON "FinancialCategory"("group");
CREATE INDEX "FinancialCategory_type_idx" ON "FinancialCategory"("type");
CREATE INDEX "FinancialCategory_order_idx" ON "FinancialCategory"("order");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialEntry_tenantId_categoryId_year_month_key" ON "FinancialEntry"("tenantId", "categoryId", "year", "month");
CREATE INDEX "FinancialEntry_tenantId_idx" ON "FinancialEntry"("tenantId");
CREATE INDEX "FinancialEntry_categoryId_idx" ON "FinancialEntry"("categoryId");
CREATE INDEX "FinancialEntry_year_month_idx" ON "FinancialEntry"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialMonthlySummary_tenantId_year_month_key" ON "FinancialMonthlySummary"("tenantId", "year", "month");
CREATE INDEX "FinancialMonthlySummary_tenantId_idx" ON "FinancialMonthlySummary"("tenantId");
CREATE INDEX "FinancialMonthlySummary_year_month_idx" ON "FinancialMonthlySummary"("year", "month");

-- AddForeignKey
ALTER TABLE "FinancialCategory" ADD CONSTRAINT "FinancialCategory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinancialEntry" ADD CONSTRAINT "FinancialEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinancialEntry" ADD CONSTRAINT "FinancialEntry_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FinancialCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinancialMonthlySummary" ADD CONSTRAINT "FinancialMonthlySummary_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
