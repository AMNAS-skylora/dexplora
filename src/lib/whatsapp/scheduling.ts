export interface ReminderSchedule {
  enabled: boolean;
  tripBatchId: string;
  templateName: string;
  languageCode: string;
  /** 0 for today, 2 for two days from now; configured by admin. */
  daysBeforeDeparture: number;
  /** India local time HH:mm. */
  sendAt: string;
}
export function isReminderDue(schedule: ReminderSchedule, departureDate: Date, now: Date) {
  if (!schedule.enabled || !Number.isInteger(schedule.daysBeforeDeparture) || schedule.daysBeforeDeparture < 0 || schedule.daysBeforeDeparture > 365) return false;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(schedule.sendAt)) return false;
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
  const localDate = `${p.year}-${p.month}-${p.day}`;
  const departureLocal = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(departureDate);
  const [y,m,d] = departureLocal.split("-").map(Number);
  const dueDay = new Date(Date.UTC(y,m-1,d-schedule.daysBeforeDeparture)).toISOString().slice(0,10);
  return localDate === dueDay && `${p.hour}:${p.minute}` === schedule.sendAt;
}
