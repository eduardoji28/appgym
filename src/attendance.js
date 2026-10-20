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

async function registerDay(db, date, now, storage) {
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

export function registerToday(db, now = new Date(), storage = globalThis.navigator?.storage) {
  return registerDay(db, localDate(now), now, storage);
}

export async function registerPastDay(db, date, now = new Date(), storage = globalThis.navigator?.storage) {
  if (!date) return { created: false, date, reason: 'missing' };
  if (date > localDate(now)) return { created: false, date, reason: 'future' };
  return registerDay(db, date, now, storage);
}

export async function unregisterDay(db, date) {
  const tx = db.transaction(STORE, 'readwrite');
  const existed = (await tx.store.get(date)) !== undefined;
  if (existed) await tx.store.delete(date);
  await tx.done;
  return { deleted: existed, date };
}

export function registeredDates(db) {
  return db.getAllKeys(STORE);
}
