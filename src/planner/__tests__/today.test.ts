import { describe, expect, test } from '@jest/globals';
import type { PlannedSlot } from '@/types/plan';
import { createDefaultSettings } from '../defaults';
import {
  addRecord,
  ensureMonthPlan,
  monthKeyOf,
  nextStudyDay,
  removeRecord,
  removeRecordAt,
  setRecordMood,
  todayStatus,
} from '../today';
import { summarize } from '../review';

describe('気持ちの記録', () => {
  test('index 番目の記録に気持ちを付け、取り消せる', () => {
    const records = [
      { date: '2027-02-01', subjectId: 'sansu' },
      { date: '2027-02-01', subjectId: 'kokugo' },
    ];
    const withMood = setRecordMood(records, 1, 'hard');
    expect(withMood[1]).toEqual({ date: '2027-02-01', subjectId: 'kokugo', mood: 'hard' });
    expect(withMood[0]).toEqual(records[0]);
    expect(removeRecordAt(withMood, 0)).toEqual([withMood[1]]);
  });
});

describe('summarize: ふり返り', () => {
  const plan2: PlannedSlot[] = [
    { date: '2027-02-01', order: 0, subjectId: 'sansu' },
    { date: '2027-02-01', order: 1, subjectId: 'kokugo' },
    { date: '2027-02-02', order: 0, subjectId: 'sansu' },
    { date: '2027-02-08', order: 0, subjectId: 'rika' },
  ];
  const records = [
    { date: '2027-02-01', subjectId: 'sansu', mood: 'good' as const },
    { date: '2027-02-01', subjectId: 'rika', mood: 'hard' as const },
    { date: '2027-02-02', subjectId: 'sansu', mood: 'hard' as const },
    { date: '2027-02-08', subjectId: 'rika' },
  ];

  test('予定のうちできた数と、教科ごとの回数・気持ちを数える', () => {
    const s = summarize(plan2, records, '2027-02-01', '2027-02-07', ['sansu', 'kokugo', 'rika']);
    expect(s.planned).toBe(3);
    expect(s.doneOfPlanned).toBe(2);
    expect(s.subjects).toEqual([
      { subjectId: 'sansu', planned: 2, studied: 2, moods: { good: 1, ok: 0, hard: 1 } },
      { subjectId: 'kokugo', planned: 1, studied: 0, moods: { good: 0, ok: 0, hard: 0 } },
      { subjectId: 'rika', planned: 0, studied: 1, moods: { good: 0, ok: 0, hard: 1 } },
    ]);
  });

  test('期間の外は数えない', () => {
    const s = summarize(plan2, records, '2027-02-08', '2027-02-08', []);
    expect(s).toEqual({
      planned: 1,
      doneOfPlanned: 1,
      subjects: [{ subjectId: 'rika', planned: 1, studied: 1, moods: { good: 0, ok: 0, hard: 0 } }],
    });
  });
});

const plan: PlannedSlot[] = [
  { date: '2027-02-01', order: 0, subjectId: 'sansu' },
  { date: '2027-02-01', order: 1, subjectId: 'kokugo' },
  { date: '2027-02-03', order: 0, subjectId: 'rika' },
];

describe('todayStatus', () => {
  test('記録がある予定は「できた」になる', () => {
    const s = todayStatus(plan, [{ date: '2027-02-01', subjectId: 'kokugo' }], '2027-02-01');
    expect(s.items.map((i) => i.done !== null)).toEqual([false, true]);
    expect(s.items[1].done?.index).toBe(0);
    expect(s.extras).toEqual([]);
    expect(s.allDone).toBe(false);
  });

  test('予定に無い教科の記録は extras に入る', () => {
    const records = [
      { date: '2027-02-01', subjectId: 'sansu' },
      { date: '2027-02-01', subjectId: 'rika' },
    ];
    const s = todayStatus(plan, records, '2027-02-01');
    expect(s.extras).toEqual([{ record: { date: '2027-02-01', subjectId: 'rika' }, index: 1 }]);
  });

  test('ほかの日の記録は数えない', () => {
    const s = todayStatus(plan, [{ date: '2027-01-31', subjectId: 'sansu' }], '2027-02-01');
    expect(s.items.every((i) => i.done === null)).toBe(true);
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
