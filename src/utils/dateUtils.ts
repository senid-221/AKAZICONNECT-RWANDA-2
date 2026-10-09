import { Job } from '../types';

export const CHECKED_DATE = '2026-10-08';

export function getKigaliParts(): Record<string, string> {
  return Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Kigali',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value])
  );
}

export function getKigaliDate(): string {
  const p = getKigaliParts();
  return `${p.year}-${p.month}-${p.day}`;
}

export function getKigaliTimeString(): string {
  const p = getKigaliParts();
  return `${p.hour}:${p.minute} CAT`;
}

export function formatDateLabel(value?: string | null): string {
  if (!value) return 'Date not specified';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Kigali',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${value}T12:00:00+02:00`));
  } catch {
    return value;
  }
}

export function isRoleOpen(job: Job): boolean {
  const today = getKigaliDate();
  if (job.deadline < today) return false;
  if (job.deadline > today) return true;
  if (!job.deadlineTime) return false;
  const p = getKigaliParts();
  return `${p.hour}:${p.minute}` < job.deadlineTime;
}

export function daysUntilClosing(job: Job): number {
  const jobTime = Date.parse(`${job.deadline}T23:59:59+02:00`);
  const nowTime = Date.now();
  const diffMs = jobTime - nowTime;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function getClosingBadge(job: Job, lang: 'en' | 'rw' = 'en'): { label: string; urgent: boolean; textClass: string } {
  const open = isRoleOpen(job);
  if (!open) {
    return {
      label: lang === 'rw' ? 'Igihe cyarangiye' : 'Deadline passed',
      urgent: false,
      textClass: 'text-amber-800 bg-amber-100 border-amber-200',
    };
  }

  const days = daysUntilClosing(job);
  if (days <= 0) {
    return {
      label: lang === 'rw' ? `Birarangira uyu munsi ${job.deadlineTime ? '(' + job.deadlineTime + ')' : ''}` : `Closes today ${job.deadlineTime ? '(' + job.deadlineTime + ' Kigali)' : ''}`,
      urgent: true,
      textClass: 'text-rose-800 bg-rose-100 border-rose-200 animate-pulse',
    };
  } else if (days <= 3) {
    return {
      label: lang === 'rw' ? `Hasigaye iminsi ${days}` : `Closes in ${days} ${days === 1 ? 'day' : 'days'}`,
      urgent: true,
      textClass: 'text-orange-800 bg-orange-100 border-orange-200',
    };
  } else if (days <= 7) {
    return {
      label: lang === 'rw' ? `Hasigaye icyumweru (${days}d)` : `Closes in ${days} days`,
      urgent: false,
      textClass: 'text-amber-800 bg-amber-50 border-amber-200',
    };
  }

  return {
    label: lang === 'rw' ? `Kugeza ${formatDateLabel(job.deadline)}` : `Closes ${formatDateLabel(job.deadline)}`,
    urgent: false,
    textClass: 'text-emerald-900 bg-emerald-50 border-emerald-200',
  };
}
