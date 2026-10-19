import { describe, expect, it } from 'vitest';
import { localDate } from '../src/attendance.js';
import { streak, weekDays } from '../src/week.js';

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

describe('streak', () => {
  const now = new Date(2026, 9, 21, 10, 0); // Wednesday, week of 2026-10-19
  const fullWeek = (monday) => {
    const [year, month, day] = monday.split('-').map(Number);
    return [0, 1, 2, 3].map((i) => localDate(new Date(year, month - 1, day + i)));
  };

  it('is zero without records', () => {
    expect(streak([], now)).toBe(0);
  });

  it('counts consecutive previous weeks with 4 or more days', () => {
    const dates = [...fullWeek('2026-10-12'), ...fullWeek('2026-10-05')];
    expect(streak(dates, now)).toBe(2);
  });

  it('adds the current week once it reaches 4 days', () => {
    const dates = [...fullWeek('2026-10-12'), '2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22'];
    expect(streak(dates, new Date(2026, 9, 22, 10, 0))).toBe(2);
  });

  it('does not break on an incomplete current week', () => {
    const dates = [...fullWeek('2026-10-12'), '2026-10-19'];
    expect(streak(dates, now)).toBe(1);
  });

  it('breaks at a previous week with fewer than 4 days', () => {
    const dates = [...fullWeek('2026-10-12'), '2026-10-05', '2026-10-06', '2026-10-07', ...fullWeek('2026-09-28')];
    expect(streak(dates, now)).toBe(1);
  });

  it('breaks at a previous week without records', () => {
    expect(streak(fullWeek('2026-10-05'), now)).toBe(0);
  });

  it('builds a full week even when it crosses a month boundary', () => {
    expect(fullWeek('2026-10-29')).toEqual(['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01']);
  });

  it('counts a Sunday in the week that ends that day and a Monday in the next', () => {
    const dates = ['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-18'];
    expect(streak(dates, now)).toBe(1);
    expect(streak(['2026-10-13', '2026-10-14', '2026-10-15', '2026-10-19'], now)).toBe(0);
  });
});
