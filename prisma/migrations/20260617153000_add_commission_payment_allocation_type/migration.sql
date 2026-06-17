ALTER TABLE "CommissionPayment"
ADD COLUMN IF NOT EXISTS "allocationType" TEXT NOT NULL DEFAULT 'current_period';

CREATE INDEX IF NOT EXISTS "CommissionPayment_allocationType_idx"
ON "CommissionPayment"("allocationType");
