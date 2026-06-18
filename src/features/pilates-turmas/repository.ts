import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  CreatePilatesClassInput,
  EnrollPilatesClassInput,
  PilatesScheduleInput,
  UpdatePilatesClassInput,
  UpdatePilatesEnrollmentInput,
} from "./schema";
import type { PilatesClassView } from "./types";

const OCCUPYING_STATUSES = ["active"] as const;

const includeClassRelations = {
  service: { select: { id: true, name: true, duration: true } },
  collaborator: { select: { id: true, name: true, role: true } },
  resource: { select: { id: true, name: true, type: true } },
  schedules: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
  enrollments: {
    include: {
      client: { select: { id: true, name: true, phone: true } },
      days: { include: { schedule: true }, orderBy: { slotNumber: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  },
} satisfies Prisma.PilatesClassInclude;

type Tx = Prisma.TransactionClient;

function normalizeOptional(value?: string) {
  return value || null;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function hasScheduleOverlap(a: { startTime: string; duration: number }, b: { startTime: string; duration: number }) {
  const aStart = timeToMinutes(a.startTime);
  const aEnd = aStart + a.duration;
  const bStart = timeToMinutes(b.startTime);
  const bEnd = bStart + b.duration;
  return aStart < bEnd && aEnd > bStart;
}

async function assertRelatedRecordsBelongToTenant(
  tx: Tx,
  tenantId: string,
  data: Pick<CreatePilatesClassInput, "serviceId" | "collaboratorId" | "resourceId">
) {
  const [service, collaborator, resource] = await Promise.all([
    data.serviceId
      ? tx.service.findFirst({ where: { id: data.serviceId, tenantId, isDeleted: false } })
      : null,
    data.collaboratorId
      ? tx.collaborator.findFirst({ where: { id: data.collaboratorId, tenantId, isDeleted: false } })
      : null,
    data.resourceId
      ? tx.resource.findFirst({ where: { id: data.resourceId, tenantId, isDeleted: false } })
      : null,
  ]);

  if (data.serviceId && !service) throw new Error("Serviço inválido.");
  if (data.collaboratorId && !collaborator) throw new Error("Instrutor inválido.");
  if (data.resourceId && !resource) throw new Error("Recurso inválido.");
}

export async function getPilatesClasses(tenantId: string) {
  const classes = await prisma.pilatesClass.findMany({
    where: { tenantId },
    include: includeClassRelations,
    orderBy: { createdAt: "desc" },
  });

  return classes.map(serializePilatesClass);
}

export async function getPilatesClassById(id: string, tenantId: string) {
  const pilatesClass = await prisma.pilatesClass.findFirst({
    where: { id, tenantId },
    include: includeClassRelations,
  });
  if (!pilatesClass) return null;

  return serializePilatesClass(pilatesClass);
}

function serializePilatesClass(
  pilatesClass: Prisma.PilatesClassGetPayload<{ include: typeof includeClassRelations }>
): PilatesClassView {
  return {
    id: pilatesClass.id,
    name: pilatesClass.name,
    serviceId: pilatesClass.serviceId,
    collaboratorId: pilatesClass.collaboratorId,
    resourceId: pilatesClass.resourceId,
    capacity: pilatesClass.capacity,
    isActive: pilatesClass.isActive,
    notes: pilatesClass.notes,
    service: pilatesClass.service
      ? {
          id: pilatesClass.service.id,
          name: pilatesClass.service.name,
        }
      : null,
    collaborator: pilatesClass.collaborator
      ? {
          id: pilatesClass.collaborator.id,
          name: pilatesClass.collaborator.name,
          role: pilatesClass.collaborator.role,
        }
      : null,
    resource: pilatesClass.resource
      ? {
          id: pilatesClass.resource.id,
          name: pilatesClass.resource.name,
          type: pilatesClass.resource.type,
        }
      : null,
    schedules: pilatesClass.schedules.map((schedule) => ({
      id: schedule.id,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      duration: schedule.duration,
    })),
    enrollments: pilatesClass.enrollments.map((enrollment) => ({
      id: enrollment.id,
      clientId: enrollment.clientId,
      frequency: enrollment.frequency,
      status: enrollment.status,
      client: {
        id: enrollment.client.id,
        name: enrollment.client.name,
        phone: enrollment.client.phone,
      },
      days: enrollment.days.map((day) => ({
        scheduleId: day.scheduleId,
        slotNumber: day.slotNumber,
      })),
    })),
    occupancyBySchedule: buildOccupancyBySchedule(pilatesClass),
  };
}

export function buildOccupancyBySchedule(pilatesClass: {
  schedules: { id: string }[];
  enrollments: { status: string; days: { scheduleId: string; slotNumber: number }[] }[];
}) {
  const occupancy = new Map<string, Set<number>>();
  for (const schedule of pilatesClass.schedules) occupancy.set(schedule.id, new Set());

  for (const enrollment of pilatesClass.enrollments) {
    if (!OCCUPYING_STATUSES.includes(enrollment.status as "active")) continue;
    for (const day of enrollment.days) {
      occupancy.get(day.scheduleId)?.add(day.slotNumber);
    }
  }

  return Object.fromEntries(
    [...occupancy.entries()].map(([scheduleId, slots]) => [scheduleId, slots.size])
  );
}

export async function createPilatesClass(tenantId: string, data: CreatePilatesClassInput) {
  return prisma.$transaction(async (tx) => {
    await assertRelatedRecordsBelongToTenant(tx, tenantId, data);

    return tx.pilatesClass.create({
      data: {
        tenantId,
        name: data.name,
        serviceId: normalizeOptional(data.serviceId),
        collaboratorId: normalizeOptional(data.collaboratorId),
        resourceId: normalizeOptional(data.resourceId),
        capacity: data.capacity,
        isActive: data.isActive,
        notes: data.notes,
        schedules: {
          create: data.schedules.map((schedule) => ({
            tenantId,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            duration: schedule.duration,
          })),
        },
      },
      include: includeClassRelations,
    });
  });
}

export async function updatePilatesClass(id: string, tenantId: string, data: UpdatePilatesClassInput) {
  return prisma.$transaction(async (tx) => {
    await assertRelatedRecordsBelongToTenant(tx, tenantId, data);

    const existing = await tx.pilatesClass.findFirstOrThrow({
      where: { id, tenantId },
      include: {
        schedules: true,
        enrollments: {
          where: { status: { in: [...OCCUPYING_STATUSES] } },
          include: { days: true },
        },
      },
    });

    const occupiedDays = existing.enrollments.flatMap((enrollment) => enrollment.days);
    const maxOccupiedSlot = occupiedDays.reduce((max, day) => Math.max(max, day.slotNumber), 0);
    if (data.capacity < maxOccupiedSlot) {
      throw new Error("Não é possível reduzir a capacidade abaixo da maior vaga ocupada.");
    }

    const incomingIds = new Set(data.schedules.map((schedule) => schedule.id).filter(Boolean));
    const schedulesToRemove = existing.schedules.filter((schedule) => !incomingIds.has(schedule.id));
    const occupiedScheduleIds = new Set(occupiedDays.map((day) => day.scheduleId));
    const occupiedRemoved = schedulesToRemove.find((schedule) => occupiedScheduleIds.has(schedule.id));
    if (occupiedRemoved) {
      throw new Error("Não é possível remover um horário com alunos inscritos.");
    }

    await tx.pilatesClass.update({
      where: { id },
      data: {
        name: data.name,
        serviceId: normalizeOptional(data.serviceId),
        collaboratorId: normalizeOptional(data.collaboratorId),
        resourceId: normalizeOptional(data.resourceId),
        capacity: data.capacity,
        isActive: data.isActive,
        notes: data.notes,
      },
    });

    if (schedulesToRemove.length > 0) {
      await tx.pilatesClassSchedule.deleteMany({
        where: { id: { in: schedulesToRemove.map((schedule) => schedule.id) }, tenantId },
      });
    }

    for (const schedule of data.schedules) {
      if (schedule.id) {
        await tx.pilatesClassSchedule.update({
          where: { id: schedule.id },
          data: {
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            duration: schedule.duration,
          },
        });
      } else {
        await tx.pilatesClassSchedule.create({
          data: {
            tenantId,
            classId: id,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            duration: schedule.duration,
          },
        });
      }
    }

    return tx.pilatesClass.findFirstOrThrow({
      where: { id, tenantId },
      include: includeClassRelations,
    });
  });
}

export async function deletePilatesClass(id: string, tenantId: string) {
  await prisma.pilatesClass.findFirstOrThrow({ where: { id, tenantId } });
  const activeEnrollments = await prisma.pilatesClassEnrollment.count({
    where: { tenantId, classId: id, status: { in: [...OCCUPYING_STATUSES] } },
  });
  if (activeEnrollments > 0) {
    throw new Error("Não é possível eliminar uma turma com alunos ativos.");
  }
  return prisma.pilatesClass.delete({ where: { id } });
}

export async function togglePilatesClassStatus(id: string, tenantId: string, isActive: boolean) {
  await prisma.pilatesClass.findFirstOrThrow({ where: { id, tenantId } });
  return prisma.pilatesClass.update({ where: { id }, data: { isActive } });
}

export async function addPilatesClassSchedule(classId: string, tenantId: string, schedule: PilatesScheduleInput) {
  await prisma.pilatesClass.findFirstOrThrow({ where: { id: classId, tenantId } });
  return prisma.pilatesClassSchedule.create({
    data: { tenantId, classId, dayOfWeek: schedule.dayOfWeek, startTime: schedule.startTime, duration: schedule.duration },
  });
}

export async function removePilatesClassSchedule(scheduleId: string, tenantId: string) {
  await prisma.pilatesClassSchedule.findFirstOrThrow({ where: { id: scheduleId, tenantId } });
  const occupied = await prisma.pilatesClassEnrollmentDay.count({
    where: { tenantId, scheduleId, enrollment: { status: { in: [...OCCUPYING_STATUSES] } } },
  });
  if (occupied > 0) throw new Error("Não é possível remover um horário com alunos inscritos.");
  return prisma.pilatesClassSchedule.delete({ where: { id: scheduleId } });
}

export async function getClassOccupancy(classId: string, tenantId: string) {
  const pilatesClass = await getPilatesClassById(classId, tenantId);
  return pilatesClass?.occupancyBySchedule ?? {};
}

export async function getAvailableSlotsBySchedule(scheduleId: string, tenantId: string) {
  const schedule = await prisma.pilatesClassSchedule.findFirstOrThrow({
    where: { id: scheduleId, tenantId },
    include: {
      pilatesClass: { select: { capacity: true } },
      enrollmentDays: {
        where: { enrollment: { status: { in: [...OCCUPYING_STATUSES] } } },
        select: { slotNumber: true },
      },
    },
  });
  const occupied = new Set(schedule.enrollmentDays.map((day) => day.slotNumber));
  return Array.from({ length: schedule.pilatesClass.capacity }, (_, index) => index + 1)
    .filter((slot) => !occupied.has(slot));
}

export async function checkSlotAvailability(
  scheduleId: string,
  slotNumber: number,
  tenantId: string,
  excludeEnrollmentId?: string
) {
  const occupied = await prisma.pilatesClassEnrollmentDay.findFirst({
    where: {
      tenantId,
      scheduleId,
      slotNumber,
      ...(excludeEnrollmentId ? { enrollmentId: { not: excludeEnrollmentId } } : {}),
      enrollment: { status: { in: [...OCCUPYING_STATUSES] } },
    },
  });
  return !occupied;
}

async function checkSlotAvailabilityInTransaction(
  tx: Tx,
  scheduleId: string,
  slotNumber: number,
  tenantId: string,
  excludeEnrollmentId?: string
) {
  const occupied = await tx.pilatesClassEnrollmentDay.findFirst({
    where: {
      tenantId,
      scheduleId,
      slotNumber,
      ...(excludeEnrollmentId ? { enrollmentId: { not: excludeEnrollmentId } } : {}),
      enrollment: { status: { in: [...OCCUPYING_STATUSES] } },
    },
  });
  return !occupied;
}

export async function checkClientScheduleConflict(
  tenantId: string,
  clientId: string,
  schedules: { id: string; dayOfWeek: number; startTime: string; duration: number }[],
  excludeEnrollmentId?: string
) {
  const sameWeekDays = schedules.map((schedule) => schedule.dayOfWeek);
  const existingDays = await prisma.pilatesClassEnrollmentDay.findMany({
    where: {
      tenantId,
      ...(excludeEnrollmentId ? { enrollmentId: { not: excludeEnrollmentId } } : {}),
      enrollment: {
        clientId,
        status: { in: [...OCCUPYING_STATUSES] },
      },
      schedule: { dayOfWeek: { in: sameWeekDays } },
    },
    include: {
      schedule: true,
      enrollment: { include: { pilatesClass: { select: { name: true } } } },
    },
  });

  for (const selected of schedules) {
    const conflict = existingDays.find((day) =>
      day.schedule.dayOfWeek === selected.dayOfWeek &&
      day.schedule.id !== selected.id &&
      hasScheduleOverlap(selected, day.schedule)
    );
    if (conflict) return conflict;
  }
  return null;
}

async function assertEnrollmentDaysAreValid(
  tx: Tx,
  tenantId: string,
  pilatesClass: { id: string; capacity: number },
  days: { scheduleId: string; slotNumber: number }[],
  clientId: string,
  excludeEnrollmentId?: string
) {
  const scheduleIds = days.map((day) => day.scheduleId);
  const schedules = await tx.pilatesClassSchedule.findMany({
    where: { tenantId, classId: pilatesClass.id, id: { in: scheduleIds } },
  });
  if (schedules.length !== scheduleIds.length) throw new Error("Horário inválido para esta turma.");

  for (const day of days) {
    if (day.slotNumber > pilatesClass.capacity) {
      throw new Error("A vaga selecionada ultrapassa a capacidade da turma.");
    }
    const available = await checkSlotAvailabilityInTransaction(
      tx,
      day.scheduleId,
      day.slotNumber,
      tenantId,
      excludeEnrollmentId
    );
    if (!available) throw new Error("A vaga selecionada já está ocupada.");

    const duplicateClient = await tx.pilatesClassEnrollmentDay.findFirst({
      where: {
        tenantId,
        scheduleId: day.scheduleId,
        ...(excludeEnrollmentId ? { enrollmentId: { not: excludeEnrollmentId } } : {}),
        enrollment: {
          clientId,
          status: { in: [...OCCUPYING_STATUSES] },
        },
      },
    });
    if (duplicateClient) throw new Error("Este cliente já está inscrito neste horário.");
  }

  const conflict = await checkClientScheduleConflict(tenantId, clientId, schedules, excludeEnrollmentId);
  if (conflict) {
    throw new Error(`Cliente já tem conflito de horário em ${conflict.enrollment.pilatesClass.name}.`);
  }

  return schedules;
}

export async function enrollClient(tenantId: string, data: EnrollPilatesClassInput) {
  return prisma.$transaction(async (tx) => {
    const pilatesClass = await tx.pilatesClass.findFirstOrThrow({
      where: { id: data.classId, tenantId },
      select: { id: true, capacity: true, isActive: true },
    });
    if (!pilatesClass.isActive) throw new Error("Turma inativa não aceita novas inscrições.");

    await tx.client.findFirstOrThrow({ where: { id: data.clientId, tenantId, isDeleted: false } });
    await assertEnrollmentDaysAreValid(tx, tenantId, pilatesClass, data.days, data.clientId);

    return tx.pilatesClassEnrollment.create({
      data: {
        tenantId,
        classId: data.classId,
        clientId: data.clientId,
        frequency: data.frequency,
        status: data.status,
        startDate: data.startDate,
        notes: data.notes,
        days: {
          create: data.status === "active"
            ? data.days.map((day) => ({ tenantId, scheduleId: day.scheduleId, slotNumber: day.slotNumber }))
            : [],
        },
      },
      include: { client: true, days: true },
    });
  });
}

export async function updatePilatesClassEnrollment(
  enrollmentId: string,
  tenantId: string,
  data: UpdatePilatesEnrollmentInput
) {
  return prisma.$transaction(async (tx) => {
    const enrollment = await tx.pilatesClassEnrollment.findFirstOrThrow({
      where: { id: enrollmentId, tenantId },
      include: { pilatesClass: { select: { id: true, capacity: true } } },
    });

    await tx.client.findFirstOrThrow({ where: { id: data.clientId, tenantId, isDeleted: false } });
    await tx.pilatesClassEnrollmentDay.deleteMany({ where: { tenantId, enrollmentId } });

    if (data.status === "active") {
      await assertEnrollmentDaysAreValid(
        tx,
        tenantId,
        enrollment.pilatesClass,
        data.days,
        data.clientId,
        enrollmentId
      );
    }

    return tx.pilatesClassEnrollment.update({
      where: { id: enrollmentId },
      data: {
        clientId: data.clientId,
        frequency: data.frequency,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate,
        notes: data.notes,
        days: {
          create: data.status === "active"
            ? data.days.map((day) => ({ tenantId, scheduleId: day.scheduleId, slotNumber: day.slotNumber }))
            : [],
        },
      },
      include: { client: true, days: true },
    });
  });
}

export async function removeEnrollment(enrollmentId: string, tenantId: string) {
  await prisma.pilatesClassEnrollment.findFirstOrThrow({ where: { id: enrollmentId, tenantId } });
  return prisma.pilatesClassEnrollment.update({
    where: { id: enrollmentId },
    data: {
      status: "cancelled",
      endDate: new Date(),
      days: { deleteMany: { tenantId } },
    },
  });
}

export async function pauseEnrollment(enrollmentId: string, tenantId: string) {
  await prisma.pilatesClassEnrollment.findFirstOrThrow({ where: { id: enrollmentId, tenantId } });
  return prisma.pilatesClassEnrollment.update({
    where: { id: enrollmentId },
    data: {
      status: "paused",
      days: { deleteMany: { tenantId } },
    },
  });
}

export async function reactivateEnrollment(enrollmentId: string, tenantId: string) {
  await prisma.pilatesClassEnrollment.findFirstOrThrow({ where: { id: enrollmentId, tenantId } });
  return prisma.pilatesClassEnrollment.update({
    where: { id: enrollmentId },
    data: { status: "active", endDate: null },
  });
}
