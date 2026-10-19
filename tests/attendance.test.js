import 'fake-indexeddb/auto';
import { describe, expect, it, vi } from 'vitest';
import { isRegistered, localDate, openAttendanceDb, registeredDates, registerToday } from '../src/attendance.js';

let dbCount = 0;
const newDbName = () => `attendance-test-${dbCount++}`;

const storageMock = (persisted = false) => ({
  persisted: vi.fn(async () => persisted),
  persist: vi.fn(async () => true),
});

describe('localDate', () => {
  it('uses the local calendar day, not the UTC one', () => {
    const lateNight = new Date(2026, 9, 18, 23, 30);
    expect(localDate(lateNight)).toBe('2026-10-18');
  });

  it('pads month and day with zeros', () => {
    expect(localDate(new Date(2026, 0, 5, 8, 0))).toBe('2026-01-05');
  });
});

describe('registerToday', () => {
  it('registers today and marks it as registered', async () => {
    const db = await openAttendanceDb(newDbName());
    const now = new Date(2026, 9, 18, 9, 0);

    const result = await registerToday(db, now, storageMock());

    expect(result).toEqual({ created: true, date: '2026-10-18' });
    expect(await isRegistered(db, '2026-10-18')).toBe(true);
  });

  it('does not create a second record when today is already registered', async () => {
    const db = await openAttendanceDb(newDbName());
    const now = new Date(2026, 9, 18, 9, 0);

    await registerToday(db, now, storageMock());
    const second = await registerToday(db, new Date(2026, 9, 18, 18, 0), storageMock());

    expect(second).toEqual({ created: false, date: '2026-10-18' });
    expect(await db.count('attendance')).toBe(1);
  });

  it('keeps every record after closing and reopening the database', async () => {
    const name = newDbName();
    const first = await openAttendanceDb(name);
    await registerToday(first, new Date(2026, 9, 17, 9, 0), storageMock());
    await registerToday(first, new Date(2026, 9, 18, 9, 0), storageMock());
    first.close();

    const reopened = await openAttendanceDb(name);

    expect(await reopened.count('attendance')).toBe(2);
    expect(await isRegistered(reopened, '2026-10-17')).toBe(true);
    expect(await isRegistered(reopened, '2026-10-18')).toBe(true);
  });

  it('reports a day without a record as not registered', async () => {
    const db = await openAttendanceDb(newDbName());

    expect(await isRegistered(db, '2026-10-18')).toBe(false);
  });
});

describe('persistent storage request', () => {
  it('asks for persistent storage when saving the first record', async () => {
    const db = await openAttendanceDb(newDbName());
    const storage = storageMock();

    await registerToday(db, new Date(2026, 9, 18, 9, 0), storage);

    expect(storage.persist).toHaveBeenCalledTimes(1);
  });

  it('does not ask again for the second record', async () => {
    const db = await openAttendanceDb(newDbName());
    const storage = storageMock();

    await registerToday(db, new Date(2026, 9, 17, 9, 0), storage);
    await registerToday(db, new Date(2026, 9, 18, 9, 0), storage);

    expect(storage.persist).toHaveBeenCalledTimes(1);
  });

  it('does not ask when the storage is already persistent', async () => {
    const db = await openAttendanceDb(newDbName());
    const storage = storageMock(true);

    await registerToday(db, new Date(2026, 9, 18, 9, 0), storage);

    expect(storage.persist).not.toHaveBeenCalled();
  });

  it('does not fail when the browser has no storage API', async () => {
    const db = await openAttendanceDb(newDbName());

    const result = await registerToday(db, new Date(2026, 9, 18, 9, 0), undefined);

    expect(result.created).toBe(true);
  });
});

describe('registeredDates', () => {
  it('lists every registered day in order', async () => {
    const db = await openAttendanceDb(newDbName());
    await registerToday(db, new Date(2026, 9, 18, 9, 0), storageMock());
    await registerToday(db, new Date(2026, 9, 17, 9, 0), storageMock());

    expect(await registeredDates(db)).toEqual(['2026-10-17', '2026-10-18']);
  });

  it('is empty without records', async () => {
    const db = await openAttendanceDb(newDbName());

    expect(await registeredDates(db)).toEqual([]);
  });
});
