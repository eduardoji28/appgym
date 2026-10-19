import { localDate } from './attendance.js';

function weekStart(now) {
  const sinceMonday = (now.getDay() + 6) % 7;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - sinceMonday);
}

function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function weekDays(now = new Date()) {
  const monday = weekStart(now);
  return Array.from({ length: 7 }, (_, i) => localDate(addDays(monday, i)));
}
