-- AlterTable
ALTER TABLE "FinancialCategory"
ADD COLUMN "calculationType" TEXT NOT NULL DEFAULT 'operational_expense';

-- Classify existing internal-finance categories.
UPDATE "FinancialCategory"
SET "calculationType" = CASE
  WHEN "name" IN ('Valor Realizado') THEN 'income'
  WHEN "name" IN ('Vencimento Pedro', 'Vencimento Rodrigo', 'Vencimento Bruna', 'Vencimento Maria', 'Técnicas', 'Recepção') THEN 'personnel_cost'
  WHEN "name" IN ('IRC / Pagamentos por Conta', 'ERS x12', 'TOC online x12') THEN 'tax'
  WHEN "name" IN ('Seguro x12', 'Seg. Acid. Trabalho x12') THEN 'insurance'
  WHEN "name" IN ('Crédito Obras', 'Investimento / Liquidar Crédito') THEN 'investment'
  WHEN "name" IN ('Poupança para Formação', 'Poupança Subsídio Férias + Natal', 'Reserva', 'Poupança Mensal') THEN 'saving_reserve'
  ELSE 'operational_expense'
END;

-- Keep the legacy type column broadly aligned for compatibility with older code.
UPDATE "FinancialCategory"
SET "type" = CASE
  WHEN "calculationType" = 'income' THEN 'revenue'
  WHEN "calculationType" = 'tax' THEN 'tax'
  WHEN "calculationType" = 'insurance' THEN 'insurance'
  WHEN "calculationType" = 'investment' THEN 'investment'
  WHEN "calculationType" = 'saving_reserve' THEN 'savings'
  ELSE 'expense'
END;

UPDATE "FinancialCategory"
SET "group" = CASE
  WHEN "name" = 'Despesas de Deslocações' THEN 'Despesas Variáveis'
  WHEN "name" = 'TOC online x12' THEN 'Impostos e Contribuições'
  ELSE "group"
END;

-- CreateIndex
CREATE INDEX "FinancialCategory_calculationType_idx" ON "FinancialCategory"("calculationType");
