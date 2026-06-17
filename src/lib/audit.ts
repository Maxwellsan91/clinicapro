import { prisma } from "@/lib/prisma";
import { TENANT_ID } from "@/constants";
import { Prisma } from "@prisma/client";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "STATUS_CHANGE"
  | "ROLE_CHANGE"
  | "MARK_PAID"
  | "MARK_PENDING"
  | "CANCEL"
  | "GENERATE_MONTH"
  | "COPY_MONTH";

export type AuditEntity =
  | "Cliente"
  | "Colaborador"
  | "Servico"
  | "Agendamento"
  | "Pagamento"
  | "Utilizador"
  | "CategoriaFinanceira"
  | "LancamentoFinanceiro"
  | "ResumoFinanceiro";

export interface AuditLogInput {
  userId: string;
  userEmail?: string | null;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Regista uma entrada no log de auditoria.
 * Nunca lança erro — falha silenciosa para não bloquear a operação principal.
 */
export async function createAuditLog(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: TENANT_ID,
        userId: input.userId,
        userEmail: input.userEmail ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        metadata: input.metadata
          ? (input.metadata as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });
  } catch (err) {
    console.error("[AuditLog] Falha ao registar auditoria:", err);
  }
}
