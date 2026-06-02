import { prisma } from "@/lib/prisma";
import { TENANT_ID } from "@/constants";

export interface AuditLogFilters {
  entity?: string;
  action?: string;
  userId?: string;
  page?: number;
}

const PAGE_SIZE = 50;

export async function getAuditLogs(filters: AuditLogFilters = {}) {
  const page = filters.page ?? 1;
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    tenantId: TENANT_ID,
    ...(filters.entity ? { entity: filters.entity } : {}),
    ...(filters.action ? { action: filters.action } : {}),
    ...(filters.userId ? { userId: filters.userId } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, page, pageSize: PAGE_SIZE };
}

