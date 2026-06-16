-- AlterTable Client: add isDeleted, deletedAt
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- AlterTable Collaborator: add commissionRate, isDeleted, deletedAt
ALTER TABLE "Collaborator" ADD COLUMN IF NOT EXISTS "commissionRate" DECIMAL(5,2);
ALTER TABLE "Collaborator" ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Collaborator" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- AlterTable Service: add isDeleted, deletedAt
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- AlterTable Appointment: add isDeleted, deletedAt
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- CreateTable CommissionPayment
CREATE TABLE IF NOT EXISTS "CommissionPayment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "collaboratorId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'payment',
    "notes" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommissionPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable Notification
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "appointmentId" TEXT,
    "sentAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable AuditLog
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable Payment
CREATE TABLE IF NOT EXISTS "Payment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paidAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,
    "invoiceStatus" TEXT NOT NULL DEFAULT 'not_issued',
    "invoiceExternalUrl" TEXT,
    "invoiceNumber" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable Resource
CREATE TABLE IF NOT EXISTS "Resource" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable AppointmentResource
CREATE TABLE IF NOT EXISTS "AppointmentResource" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,

    CONSTRAINT "AppointmentResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CommissionPayment_tenantId_idx" ON "CommissionPayment"("tenantId");
CREATE INDEX IF NOT EXISTS "CommissionPayment_collaboratorId_idx" ON "CommissionPayment"("collaboratorId");
CREATE INDEX IF NOT EXISTS "CommissionPayment_paidAt_idx" ON "CommissionPayment"("paidAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Notification_tenantId_idx" ON "Notification"("tenantId");
CREATE INDEX IF NOT EXISTS "Notification_status_idx" ON "Notification"("status");
CREATE INDEX IF NOT EXISTS "Notification_type_idx" ON "Notification"("type");
CREATE INDEX IF NOT EXISTS "Notification_appointmentId_idx" ON "Notification"("appointmentId");
CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuditLog_tenantId_idx" ON "AuditLog"("tenantId");
CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_entity_idx" ON "AuditLog"("entity");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Payment_tenantId_idx" ON "Payment"("tenantId");
CREATE INDEX IF NOT EXISTS "Payment_clientId_idx" ON "Payment"("clientId");
CREATE INDEX IF NOT EXISTS "Payment_appointmentId_idx" ON "Payment"("appointmentId");
CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"("status");
CREATE INDEX IF NOT EXISTS "Payment_dueDate_idx" ON "Payment"("dueDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Resource_tenantId_idx" ON "Resource"("tenantId");

-- CreateIndex (unique)
CREATE UNIQUE INDEX IF NOT EXISTS "AppointmentResource_appointmentId_resourceId_key" ON "AppointmentResource"("appointmentId", "resourceId");

-- AddForeignKey CommissionPayment -> Collaborator
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CommissionPayment_collaboratorId_fkey'
  ) THEN
    ALTER TABLE "CommissionPayment" ADD CONSTRAINT "CommissionPayment_collaboratorId_fkey"
      FOREIGN KEY ("collaboratorId") REFERENCES "Collaborator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey Payment -> Tenant
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Payment_tenantId_fkey'
  ) THEN
    ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tenantId_fkey"
      FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey Payment -> Client
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Payment_clientId_fkey'
  ) THEN
    ALTER TABLE "Payment" ADD CONSTRAINT "Payment_clientId_fkey"
      FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey Payment -> Appointment
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Payment_appointmentId_fkey'
  ) THEN
    ALTER TABLE "Payment" ADD CONSTRAINT "Payment_appointmentId_fkey"
      FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey Resource -> Tenant
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Resource_tenantId_fkey'
  ) THEN
    ALTER TABLE "Resource" ADD CONSTRAINT "Resource_tenantId_fkey"
      FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey AppointmentResource -> Appointment
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'AppointmentResource_appointmentId_fkey'
  ) THEN
    ALTER TABLE "AppointmentResource" ADD CONSTRAINT "AppointmentResource_appointmentId_fkey"
      FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey AppointmentResource -> Resource
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'AppointmentResource_resourceId_fkey'
  ) THEN
    ALTER TABLE "AppointmentResource" ADD CONSTRAINT "AppointmentResource_resourceId_fkey"
      FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

