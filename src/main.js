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
try {
  db = await openAttendanceDb();
  const today = localDate();
  todayLabel.textContent = today;
  showStatus(await isRegistered(db, today));
} catch {
  showError('No se pudo abrir el almacenamiento de la app.');
}

registerButton.addEventListener('click', async () => {
  try {
    await registerToday(db);
    showStatus(true);
  } catch {
    showError('No se pudo guardar el registro. Intenta de nuevo.');
  }
});
