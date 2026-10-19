import { localDate } from './attendance.js';

const GOAL = 4;

function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function weekStart(date) {
  return addDays(date, -((date.getDay() + 6) % 7));
}

export function weekDays(now = new Date()) {
  const monday = weekStart(now);
  return Array.from({ length: 7 }, (_, i) => localDate(addDays(monday, i)));
}

export function streak(registeredDates, now = new Date()) {
  const perWeek = new Map();
  for (const date of registeredDates) {
    const [year, month, day] = date.split('-').map(Number);
    const key = localDate(weekStart(new Date(year, month - 1, day)));
    perWeek.set(key, (perWeek.get(key) ?? 0) + 1);
  }
  const met = (monday) => (perWeek.get(localDate(monday)) ?? 0) >= GOAL;

  // An unfinished current week neither adds to the streak nor breaks it.
  let monday = weekStart(now);
  if (!met(monday)) monday = addDays(monday, -7);
  let weeks = 0;
  while (met(monday)) {
    weeks++;
    monday = addDays(monday, -7);
  }
  return weeks;
}
