import './style.css';
import { isRegistered, localDate, openAttendanceDb, registerToday } from './attendance.js';

const todayLabel = document.querySelector('#today');
const statusLabel = document.querySelector('#status');
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

async function refresh() {
  const today = localDate();
  todayLabel.textContent = today;
  showStatus(await isRegistered(db, today));
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
