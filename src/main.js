import './style.css';
import { localDate, openAttendanceDb, registeredDates, registerPastDay, registerToday } from './attendance.js';
import { streak, weekDays } from './week.js';

const todayLabel = document.querySelector('#today');
const statusLabel = document.querySelector('#status');
const weekList = document.querySelector('#week');
const streakLabel = document.querySelector('#streak');
const registerButton = document.querySelector('#register');
const pastForm = document.querySelector('#past');
const pastDate = document.querySelector('#past-date');
const pastStatus = document.querySelector('#past-status');

function showStatus(registered) {
  statusLabel.textContent = registered ? 'Hoy ya quedó registrado.' : 'Hoy aún no lo registras.';
  statusLabel.dataset.registered = String(registered);
}

function showError(message) {
  statusLabel.textContent = message;
  statusLabel.dataset.registered = 'false';
}

let db;

const DAY_NAMES = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

function showWeek(days, registered) {
  weekList.replaceChildren(
    ...days.map((date, i) => {
      const item = document.createElement('li');
      const attended = registered.has(date);
      item.textContent = DAY_NAMES[i][0].toUpperCase();
      item.dataset.registered = String(attended);
      item.title = date;
      item.setAttribute('aria-label', `${DAY_NAMES[i]} ${date}: ${attended ? 'asististe' : 'sin registro'}`);
      return item;
    }),
  );
}

function showStreak(weeks) {
  streakLabel.textContent = weeks === 1 ? 'Racha: 1 semana' : `Racha: ${weeks} semanas`;
}

async function refresh() {
  const now = new Date();
  const today = localDate(now);
  const dates = await registeredDates(db);
  const registered = new Set(dates);
  todayLabel.textContent = today;
  pastDate.max = today;
  showStatus(registered.has(today));
  showWeek(weekDays(now), registered);
  showStreak(streak(dates, now));
}

try {
  db = await openAttendanceDb();
  await refresh();
} catch {
  showError('No se pudo abrir el almacenamiento de la app.');
}

registerButton.addEventListener('click', async () => {
  try {
    await registerToday(db);
    await refresh();
  } catch {
    showError('No se pudo guardar el registro. Intenta de nuevo.');
  }
});

const PAST_MESSAGES = {
  missing: 'Elige un día.',
  future: 'Solo se pueden marcar días pasados.',
};

pastForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const { created, reason } = await registerPastDay(db, pastDate.value);
    await refresh();
    pastStatus.textContent = created ? 'Día registrado.' : (PAST_MESSAGES[reason] ?? 'Ese día ya estaba registrado.');
  } catch {
    pastStatus.textContent = 'No se pudo guardar el registro. Intenta de nuevo.';
  }
});

// An installed app stays open in the background: recompute "today" when it comes back.
document.addEventListener('visibilitychange', () => {
  if (db && !document.hidden) refresh().catch(() => showError('No se pudo leer el registro de hoy.'));
});
