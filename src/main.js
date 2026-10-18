import './style.css';
import { isRegistered, localDate, openAttendanceDb, registerToday } from './attendance.js';

const todayLabel = document.querySelector('#today');
const statusLabel = document.querySelector('#status');
const registerButton = document.querySelector('#register');

function showStatus(registered) {
  statusLabel.textContent = registered ? 'Hoy ya quedó registrado.' : 'Hoy aún no lo registras.';
  statusLabel.dataset.registered = String(registered);
}

const db = await openAttendanceDb();
const today = localDate();
todayLabel.textContent = today;
showStatus(await isRegistered(db, today));

registerButton.addEventListener('click', async () => {
  await registerToday(db);
  showStatus(true);
});
