import './style.css';
import { localDate, openAttendanceDb, registeredDates, registerToday } from './attendance.js';
import { streak, weekDays } from './week.js';

const todayLabel = document.querySelector('#today');
const statusLabel = document.querySelector('#status');
const weekList = document.querySelector('#week');
const streakLabel = document.querySelector('#streak');
const registerButton = document.querySelector('#register');

function showStatus(registered) {
  statusLabel.textContent = registered ? 'Hoy ya quedó registrado.' : 'Hoy aún no lo registras.';
  statusLabel.dataset.registered = String(registered);
}

function showError(message) {
  statusLabel.textContent = message;
  statusLabel.dataset.registered = 'false';
}

let db;

const DAY_LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function showWeek(days, registered) {
  weekList.replaceChildren(
    ...days.map((date, i) => {
      const item = document.createElement('li');
      item.textContent = DAY_LETTERS[i];
      item.dataset.registered = String(registered.has(date));
      item.title = date;
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

// An installed app stays open in the background: recompute "today" when it comes back.
document.addEventListener('visibilitychange', () => {
  if (db && !document.hidden) refresh().catch(() => showError('No se pudo leer el registro de hoy.'));
});
