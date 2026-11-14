import { describe, expect, test } from '@jest/globals';
import type { PlannedSlot } from '@/types/plan';
import { createDefaultSettings } from '../defaults';
import {
  addRecord,
  ensureMonthPlan,
  monthKeyOf,
  nextStudyDay,
  removeRecord,
  todayStatus,
} from '../today';

const plan: PlannedSlot[] = [
  { date: '2027-02-01', order: 0, subjectId: 'sansu' },
  { date: '2027-02-01', order: 1, subjectId: 'kokugo' },
  { date: '2027-02-03', order: 0, subjectId: 'rika' },
];

describe('todayStatus', () => {
  test('記録がある予定は「できた」になる', () => {
    const s = todayStatus(plan, [{ date: '2027-02-01', subjectId: 'kokugo' }], '2027-02-01');
    expect(s.items.map((i) => i.done)).toEqual([false, true]);
    expect(s.extras).toEqual([]);
    expect(s.allDone).toBe(false);
  });

  test('予定に無い教科の記録は extras に入る', () => {
    const records = [
      { date: '2027-02-01', subjectId: 'sansu' },
      { date: '2027-02-01', subjectId: 'rika' },
    ];
    const s = todayStatus(plan, records, '2027-02-01');
    expect(s.extras).toEqual([{ date: '2027-02-01', subjectId: 'rika' }]);
  });

  test('ほかの日の記録は数えない', () => {
    const s = todayStatus(plan, [{ date: '2027-01-31', subjectId: 'sansu' }], '2027-02-01');
    expect(s.items.every((i) => !i.done)).toBe(true);
  });

  test('ぜんぶできたら allDone、予定が無い日は false', () => {
    const records = [
      { date: '2027-02-01', subjectId: 'sansu' },
      { date: '2027-02-01', subjectId: 'kokugo' },
    ];
    expect(todayStatus(plan, records, '2027-02-01').allDone).toBe(true);
    expect(todayStatus(plan, records, '2027-02-02').allDone).toBe(false);
  });
});

describe('addRecord / removeRecord', () => {
  test('足して、1つだけ取り消せる', () => {
    let records = addRecord([], '2027-02-01', 'sansu');
    records = addRecord(records, '2027-02-01', 'sansu');
    records = removeRecord(records, '2027-02-01', 'sansu');
    expect(records).toEqual([{ date: '2027-02-01', subjectId: 'sansu' }]);
  });

  test('無い記録を取り消しても何も変わらない', () => {
    const records = [{ date: '2027-02-01', subjectId: 'sansu' }];
    expect(removeRecord(records, '2027-02-02', 'sansu')).toEqual(records);
  });
});

describe('ensureMonthPlan', () => {
  test('まだ無い月だけ計画を作る', () => {
    const settings = createDefaultSettings();
    const first = ensureMonthPlan(settings, [], [], '2027-02-10');
    expect(first.plannedMonths).toEqual(['2027-02']);
    expect(first.plan.length).toBeGreaterThan(0);
    expect(first.plan.every((s) => monthKeyOf(s.date) === '2027-02')).toBe(true);

    const again = ensureMonthPlan(settings, first.plan, first.plannedMonths, '2027-02-20');
    expect(again.plan).toEqual(first.plan);
  });
});

describe('nextStudyDay', () => {
  test('次に予定がある日の予定を返す', () => {
    expect(nextStudyDay(plan, '2027-02-01').map((s) => s.subjectId)).toEqual(['rika']);
    expect(nextStudyDay(plan, '2027-02-03')).toEqual([]);
  });
});
