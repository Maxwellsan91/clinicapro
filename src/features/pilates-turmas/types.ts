export interface PilatesScheduleView {
  id: string;
  dayOfWeek: number;
  startTime: string;
  duration: number;
}

export interface PilatesClientView {
  id: string;
  name: string;
  phone?: string | null;
}

export interface PilatesEnrollmentDayView {
  scheduleId: string;
  slotNumber: number;
}

export interface PilatesEnrollmentView {
  id: string;
  clientId: string;
  frequency: string;
  status: string;
  client: PilatesClientView;
  days: PilatesEnrollmentDayView[];
}

export interface PilatesClassView {
  id: string;
  name: string;
  serviceId?: string | null;
  collaboratorId?: string | null;
  resourceId?: string | null;
  capacity: number;
  isActive: boolean;
  notes?: string | null;
  service?: { id: string; name: string } | null;
  collaborator?: { id: string; name: string; role?: string | null } | null;
  resource?: { id: string; name: string; type?: string | null } | null;
  schedules: PilatesScheduleView[];
  enrollments: PilatesEnrollmentView[];
  occupancyBySchedule: Record<string, number>;
}

export type ActionResult = {
  success: boolean;
  error?: Record<string, string[]> | string;
};
