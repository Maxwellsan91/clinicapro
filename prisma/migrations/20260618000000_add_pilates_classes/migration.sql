-- CreateTable PilatesClass
CREATE TABLE IF NOT EXISTS "PilatesClass" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serviceId" TEXT,
    "collaboratorId" TEXT,
    "resourceId" TEXT,
    "capacity" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PilatesClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable PilatesClassSchedule
CREATE TABLE IF NOT EXISTS "PilatesClassSchedule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PilatesClassSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable PilatesClassEnrollment
CREATE TABLE IF NOT EXISTS "PilatesClassEnrollment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PilatesClassEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable PilatesClassEnrollmentDay
CREATE TABLE IF NOT EXISTS "PilatesClassEnrollmentDay" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "slotNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PilatesClassEnrollmentDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PilatesClass_tenantId_idx" ON "PilatesClass"("tenantId");
CREATE INDEX IF NOT EXISTS "PilatesClass_serviceId_idx" ON "PilatesClass"("serviceId");
CREATE INDEX IF NOT EXISTS "PilatesClass_collaboratorId_idx" ON "PilatesClass"("collaboratorId");
CREATE INDEX IF NOT EXISTS "PilatesClass_resourceId_idx" ON "PilatesClass"("resourceId");
CREATE INDEX IF NOT EXISTS "PilatesClassSchedule_tenantId_idx" ON "PilatesClassSchedule"("tenantId");
CREATE INDEX IF NOT EXISTS "PilatesClassSchedule_classId_idx" ON "PilatesClassSchedule"("classId");
CREATE INDEX IF NOT EXISTS "PilatesClassEnrollment_tenantId_idx" ON "PilatesClassEnrollment"("tenantId");
CREATE INDEX IF NOT EXISTS "PilatesClassEnrollment_classId_idx" ON "PilatesClassEnrollment"("classId");
CREATE INDEX IF NOT EXISTS "PilatesClassEnrollment_clientId_idx" ON "PilatesClassEnrollment"("clientId");
CREATE INDEX IF NOT EXISTS "PilatesClassEnrollment_status_idx" ON "PilatesClassEnrollment"("status");
CREATE INDEX IF NOT EXISTS "PilatesClassEnrollmentDay_tenantId_idx" ON "PilatesClassEnrollmentDay"("tenantId");
CREATE INDEX IF NOT EXISTS "PilatesClassEnrollmentDay_enrollmentId_idx" ON "PilatesClassEnrollmentDay"("enrollmentId");
CREATE INDEX IF NOT EXISTS "PilatesClassEnrollmentDay_scheduleId_idx" ON "PilatesClassEnrollmentDay"("scheduleId");

-- CreateIndex unique
CREATE UNIQUE INDEX IF NOT EXISTS "PilatesClassSchedule_classId_dayOfWeek_startTime_key"
  ON "PilatesClassSchedule"("classId", "dayOfWeek", "startTime");
CREATE UNIQUE INDEX IF NOT EXISTS "PilatesClassEnrollmentDay_scheduleId_slotNumber_key"
  ON "PilatesClassEnrollmentDay"("scheduleId", "slotNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "PilatesClassEnrollmentDay_enrollmentId_scheduleId_key"
  ON "PilatesClassEnrollmentDay"("enrollmentId", "scheduleId");

-- AddForeignKey PilatesClass
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PilatesClass_tenantId_fkey') THEN
    ALTER TABLE "PilatesClass" ADD CONSTRAINT "PilatesClass_tenantId_fkey"
      FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PilatesClass_serviceId_fkey') THEN
    ALTER TABLE "PilatesClass" ADD CONSTRAINT "PilatesClass_serviceId_fkey"
      FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PilatesClass_collaboratorId_fkey') THEN
    ALTER TABLE "PilatesClass" ADD CONSTRAINT "PilatesClass_collaboratorId_fkey"
      FOREIGN KEY ("collaboratorId") REFERENCES "Collaborator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PilatesClass_resourceId_fkey') THEN
    ALTER TABLE "PilatesClass" ADD CONSTRAINT "PilatesClass_resourceId_fkey"
      FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey PilatesClassSchedule
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PilatesClassSchedule_tenantId_fkey') THEN
    ALTER TABLE "PilatesClassSchedule" ADD CONSTRAINT "PilatesClassSchedule_tenantId_fkey"
      FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PilatesClassSchedule_classId_fkey') THEN
    ALTER TABLE "PilatesClassSchedule" ADD CONSTRAINT "PilatesClassSchedule_classId_fkey"
      FOREIGN KEY ("classId") REFERENCES "PilatesClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey PilatesClassEnrollment
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PilatesClassEnrollment_tenantId_fkey') THEN
    ALTER TABLE "PilatesClassEnrollment" ADD CONSTRAINT "PilatesClassEnrollment_tenantId_fkey"
      FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PilatesClassEnrollment_classId_fkey') THEN
    ALTER TABLE "PilatesClassEnrollment" ADD CONSTRAINT "PilatesClassEnrollment_classId_fkey"
      FOREIGN KEY ("classId") REFERENCES "PilatesClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PilatesClassEnrollment_clientId_fkey') THEN
    ALTER TABLE "PilatesClassEnrollment" ADD CONSTRAINT "PilatesClassEnrollment_clientId_fkey"
      FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey PilatesClassEnrollmentDay
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PilatesClassEnrollmentDay_tenantId_fkey') THEN
    ALTER TABLE "PilatesClassEnrollmentDay" ADD CONSTRAINT "PilatesClassEnrollmentDay_tenantId_fkey"
      FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PilatesClassEnrollmentDay_enrollmentId_fkey') THEN
    ALTER TABLE "PilatesClassEnrollmentDay" ADD CONSTRAINT "PilatesClassEnrollmentDay_enrollmentId_fkey"
      FOREIGN KEY ("enrollmentId") REFERENCES "PilatesClassEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PilatesClassEnrollmentDay_scheduleId_fkey') THEN
    ALTER TABLE "PilatesClassEnrollmentDay" ADD CONSTRAINT "PilatesClassEnrollmentDay_scheduleId_fkey"
      FOREIGN KEY ("scheduleId") REFERENCES "PilatesClassSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
