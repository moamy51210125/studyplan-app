import { describe, expect, test } from '@jest/globals';
import { buildMonthPlan } from '../build-plan';
import { dayView, planForRange, weekDays } from '../calendar';
import { createDefaultSettings } from '../defaults';

const settings = createDefaultSettings();
const feb = buildMonthPlan(settings, 2027, 2);

describe('dayView', () => {
  test('その日の予定・できた数・お休み・今日かどうか', () => {
    const date = '2027-02-06'; // 土曜（初期設定で2回）
    const subjectId = feb.find((s) => s.date === date)!.subjectId;
    const v = dayView(feb, [{ date, subjectId }], ['2027-02-02'], date, '2027-02-07');
    expect(v).toMatchObject({ isToday: false, isPast: true, isRest: false, planned: 2, done: 1 });
    expect(dayView(feb, [], ['2027-02-02'], '2027-02-02', '2027-02-02')).toMatchObject({
      isToday: true,
      isRest: true,
    });
  });
});

describe('weekDays', () => {
  test('7日分', () => {
    expect(weekDays('2027-02-01')).toEqual([
      '2027-02-01',
      '2027-02-02',
      '2027-02-03',
      '2027-02-04',
      '2027-02-05',
      '2027-02-06',
      '2027-02-07',
    ]);
  });
});

describe('planForRange', () => {
  test('作り終えた月は保存されている予定を使う', () => {
    const r = planForRange(feb, ['2027-02'], settings, '2027-02-01', '2027-02-07', '2027-02-03');
    expect(r.preview).toBe(false);
    expect(r.slots).toEqual(feb.filter((s) => s.date <= '2027-02-07'));
  });

  test('来月でまだ作っていない月は、見こみを組む', () => {
    const r = planForRange(feb, ['2027-02'], settings, '2027-02-22', '2027-03-07', '2027-02-25');
    expect(r.preview).toBe(true);
    expect(r.slots.some((s) => s.date >= '2027-03-01')).toBe(true);
    expect(r.slots.every((s) => s.date >= '2027-02-22' && s.date <= '2027-03-07')).toBe(true);
  });

  test('前の月で計画が無い月は、予定なし', () => {
    const r = planForRange(feb, ['2027-02'], settings, '2027-01-01', '2027-01-31', '2027-02-03');
    expect(r).toEqual({ slots: [], preview: false });
  });
});
