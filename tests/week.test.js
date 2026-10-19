import { describe, expect, it } from 'vitest';
import { weekDays } from '../src/week.js';

describe('weekDays', () => {
  it('lists the seven days of the week from Monday to Sunday', () => {
    expect(weekDays(new Date(2026, 9, 21, 10, 0))).toEqual([
      '2026-10-19',
      '2026-10-20',
      '2026-10-21',
      '2026-10-22',
      '2026-10-23',
      '2026-10-24',
      '2026-10-25',
    ]);
  });

  it('keeps a Sunday in the week that ends that day', () => {
    const days = weekDays(new Date(2026, 9, 25, 23, 0));
    expect(days[0]).toBe('2026-10-19');
    expect(days[6]).toBe('2026-10-25');
  });

  it('starts a new week on Monday', () => {
    const days = weekDays(new Date(2026, 9, 26, 0, 5));
    expect(days[0]).toBe('2026-10-26');
    expect(days[6]).toBe('2026-11-01');
  });

  it('crosses the year boundary', () => {
    const days = weekDays(new Date(2026, 0, 1, 9, 0));
    expect(days[0]).toBe('2025-12-29');
    expect(days[6]).toBe('2026-01-04');
  });
});
