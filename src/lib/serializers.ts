/**
 * Serializa objectos Prisma para plain objects seguros de passar
 * de Server Components para Client Components.
 *
 * Converte campos Decimal → number.
 */

import type { Collaborator, Service, Payment } from "@prisma/client";

// ── Colaborador ────────────────────────────────────────────────────────────

export type SerializedCollaborator = Omit<Collaborator, "commissionRate"> & {
  commissionRate: number | null;
};

export function serializeCollaborator(c: Collaborator): SerializedCollaborator {
  return {
    ...c,
    commissionRate: c.commissionRate != null ? Number(c.commissionRate) : null,
  };
}

export function serializeCollaborators(list: Collaborator[]): SerializedCollaborator[] {
  return list.map(serializeCollaborator);
}

// ── Serviço ────────────────────────────────────────────────────────────────

export type SerializedService = Omit<Service, "price"> & {
  price: number;
};

export function serializeService(s: Service): SerializedService {
  return {
    ...s,
    price: Number(s.price),
  };
}

export function serializeServices(list: Service[]): SerializedService[] {
  return list.map(serializeService);
}

// ── Pagamento ──────────────────────────────────────────────────────────────

export type SerializedPayment = Omit<Payment, "amount"> & {
  amount: number;
};

export function serializePayment(p: Payment): SerializedPayment {
  return {
    ...p,
    amount: Number(p.amount),
  };
}

export function serializePayments(list: Payment[]): SerializedPayment[] {
  return list.map(serializePayment);
}
