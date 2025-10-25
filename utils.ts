import { MasterProject, ScheduledProject, DayTemplate, WeeklySchedule, Day, Hour } from './types';
import { DAYS_OF_WEEK, HOURS_OF_DAY } from './constants';

export function generateUUID(): string {
  return crypto.randomUUID();
}

// --- Type Guard Validators ---

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isMasterProject(obj: unknown): obj is MasterProject {
  return (
    isObject(obj) &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.color === 'string'
  );
}

export function isScheduledProject(obj: unknown): obj is ScheduledProject {
  return (
    isMasterProject(obj) &&
    // FIX: After `isMasterProject(obj)` narrows the type of `obj` to `MasterProject`,
    // properties not on `MasterProject` are inaccessible. Cast to `any` to check them.
    typeof (obj as any).masterId === 'string' &&
    typeof (obj as any).probability === 'number'
  );
}

export function isDayTemplate(obj: unknown): obj is DayTemplate {
  if (!isObject(obj) || typeof obj.id !== 'string' || typeof obj.name !== 'string' || !isObject(obj.schedule)) {
    return false;
  }
  for (const hour in obj.schedule) {
    const hourNum = parseInt(hour, 10);
    if (isNaN(hourNum) || !HOURS_OF_DAY.includes(hourNum as Hour)) return false;
    const projects = obj.schedule[hour];
    if (!Array.isArray(projects) || !projects.every(isScheduledProject)) return false;
  }
  return true;
}

export function isWeeklySchedule(obj: unknown): obj is WeeklySchedule {
  if (!isObject(obj)) return false;
  for (const day in obj) {
    if (!DAYS_OF_WEEK.includes(day as Day)) return false;
    const daySchedule = obj[day];
    if (!isObject(daySchedule)) return false;
    for (const hour in daySchedule) {
      const hourNum = parseInt(hour, 10);
      if (isNaN(hourNum) || !HOURS_OF_DAY.includes(hourNum as Hour)) return false;
      const projects = daySchedule[hour];
      if (!Array.isArray(projects) || !projects.every(isScheduledProject)) return false;
    }
  }
  return true;
}

export function isMasterProjectArray(arr: unknown): arr is MasterProject[] {
    return Array.isArray(arr) && arr.every(isMasterProject);
}

export function isDayTemplateArray(arr: unknown): arr is DayTemplate[] {
    return Array.isArray(arr) && arr.every(isDayTemplate);
}