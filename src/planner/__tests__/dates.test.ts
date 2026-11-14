import { describe, expect, test } from '@jest/globals';
import {
  addDays,
  daysBetween,
  eachDay,
  monthRange,
  monthRangeOf,
  toDateKey,
  weekdayOf,
  weekRangeOf,
} from '../dates';

describe('dates', () => {
  test('曜日を求められる（2027-02-01 は月曜日）', () => {
    expect(weekdayOf('2027-02-01')).toBe(1);
    expect(weekdayOf('2027-02-07')).toBe(0);
  });

  test('月をまたいで日付を足せる', () => {
    expect(addDays('2027-01-31', 1)).toBe('2027-02-01');
    expect(addDays('2027-03-01', -1)).toBe('2027-02-28');
  });

  test('うるう年の2月は29日まで', () => {
    expect(monthRange(2028, 2)).toEqual({ from: '2028-02-01', to: '2028-02-29' });
    expect(monthRangeOf('2027-02-15')).toEqual({ from: '2027-02-01', to: '2027-02-28' });
  });

  test('期間の日付を両端こみで並べられる', () => {
    expect(eachDay('2027-01-30', '2027-02-02')).toEqual([
      '2027-01-30',
      '2027-01-31',
      '2027-02-01',
      '2027-02-02',
    ]);
    expect(daysBetween('2027-02-01', '2027-02-20')).toBe(19);
  });

  test('週は月曜はじまり（日曜はじまりも指定できる）', () => {
    expect(weekRangeOf('2027-02-10')).toEqual({ from: '2027-02-08', to: '2027-02-14' });
    expect(weekRangeOf('2027-02-10', 0)).toEqual({ from: '2027-02-07', to: '2027-02-13' });
  });

  test('ローカル日付から DateKey を作れる', () => {
    expect(toDateKey(new Date(2027, 1, 5, 23, 59))).toBe('2027-02-05');
  });

  test('おかしな日付はエラーにする', () => {
    expect(() => addDays('2027-02-30', 1)).toThrow();
    expect(() => addDays('2027/02/01', 1)).toThrow();
  });
});
