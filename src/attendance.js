import { openDB } from 'idb';

const STORE = 'attendance';

export function localDate(now = new Date()) {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function openAttendanceDb(name = 'appgym') {
  return openDB(name, 1, {
    upgrade(db) {
      db.createObjectStore(STORE, { keyPath: 'date' });
    },
  });
}

export async function isRegistered(db, date) {
  return (await db.get(STORE, date)) !== undefined;
}

async function requestPersistentStorage(storage) {
  if (!storage?.persist) return;
  try {
    if (storage.persisted && (await storage.persisted())) return;
    await storage.persist();
  } catch {
    // The record is already saved: a refused request must not undo it.
  }
}

export async function registerToday(db, now = new Date(), storage = globalThis.navigator?.storage) {
  const date = localDate(now);
  const tx = db.transaction(STORE, 'readwrite');
  if (await tx.store.get(date)) {
    await tx.done;
    return { created: false, date };
  }
  const total = await tx.store.count();
  await tx.store.add({ date, registeredAt: now.toISOString() });
  await tx.done;
  if (total === 0) await requestPersistentStorage(storage);
  return { created: true, date };
}

export function registeredDates(db) {
  return db.getAllKeys(STORE);
}
