import { describe, expect, test } from '@jest/globals';
import type { PlannedSlot, PlanSettings, SlotsPerWeekday } from '@/types/plan';
import { buildMonthPlan, buildPlan, countBySubject, slotsInRange } from '../build-plan';
import { createDefaultSettings } from '../defaults';
import { addDays, eachDay } from '../dates';
import { addCustomSubject, setSubjectEnabled } from '../subjects';

const EVERY_DAY_2: SlotsPerWeekday = { 0: 2, 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2 };

/** 7教科すべてオン・毎日2回の設定 */
function allSubjectsSettings(): PlanSettings {
  const s = createDefaultSettings();
  return {
    ...s,
    subjects: s.subjects.map((x) => ({ ...x, enabled: true })),
    slotsPerWeekday: EVERY_DAY_2,
  };
}

function spread(plan: PlannedSlot[], subjectIds: string[]): number {
  const counts = countBySubject(plan);
  const values = subjectIds.map((id) => counts[id] ?? 0);
  return Math.max(...values) - Math.min(...values);
}

const ALL = ['sansu', 'kokugo', 'rika', 'shakai', 'eigo', 'kanken', 'eiken'];

// 2027年2月は月曜日はじまりの28日間（ちょうど4週）
describe('buildPlan: 偏りのない計画', () => {
  test('月の計画で、どの教科もちょうど同じ回数になる', () => {
    const plan = buildMonthPlan(allSubjectsSettings(), 2027, 2);
    expect(plan).toHaveLength(56);
    expect(countBySubject(plan)).toEqual(Object.fromEntries(ALL.map((id) => [id, 8])));
  });

  test('週ごとに見ても、どの教科も同じ回数になる', () => {
    const plan = buildMonthPlan(allSubjectsSettings(), 2027, 2);
    for (let week = 0; week < 4; week++) {
      const from = addDays('2027-02-01', week * 7);
      const weekPlan = slotsInRange(plan, from, addDays(from, 6));
      expect(countBySubject(weekPlan)).toEqual(Object.fromEntries(ALL.map((id) => [id, 2])));
    }
  });

  test('割り切れないときも、回数の差は1回まで', () => {
    // 初期設定：5教科・平日2回・土曜3回・日曜0回（3月は31日）
    const plan = buildMonthPlan(createDefaultSettings(), 2027, 3);
    expect(spread(plan, ['sansu', 'kokugo', 'rika', 'shakai', 'eigo'])).toBeLessThanOrEqual(1);
  });

  test('同じ日に同じ教科は入らない', () => {
    const plan = buildMonthPlan(allSubjectsSettings(), 2027, 2);
    for (const date of eachDay('2027-02-01', '2027-02-28')) {
      const ids = plan.filter((s) => s.date === date).map((s) => s.subjectId);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  test('教科数が十分あれば、前の日と同じ教科は続かない', () => {
    const plan = buildMonthPlan(allSubjectsSettings(), 2027, 2);
    for (const date of eachDay('2027-02-02', '2027-02-28')) {
      const today = plan.filter((s) => s.date === date).map((s) => s.subjectId);
      const yesterday = plan.filter((s) => s.date === addDays(date, -1)).map((s) => s.subjectId);
      expect(today.filter((id) => yesterday.includes(id))).toEqual([]);
    }
  });

  test('毎回同じ結果になる', () => {
    const settings = allSubjectsSettings();
    expect(buildMonthPlan(settings, 2027, 2)).toEqual(buildMonthPlan(settings, 2027, 2));
  });
});

describe('buildPlan: 設定の反映', () => {
  test('オフにした教科は入らない', () => {
    const settings = allSubjectsSettings();
    settings.subjects = setSubjectEnabled(settings.subjects, 'shakai', false);
    const plan = buildMonthPlan(settings, 2027, 2);
    expect(plan.some((s) => s.subjectId === 'shakai')).toBe(false);
    expect(spread(plan, ALL.filter((id) => id !== 'shakai'))).toBeLessThanOrEqual(1);
  });

  test('自分で追加した教科も計画に入る', () => {
    const settings = allSubjectsSettings();
    settings.subjects = addCustomSubject(settings.subjects, 'どくしょ');
    const plan = buildMonthPlan(settings, 2027, 2);
    expect(plan.some((s) => s.subjectId === 'custom-1')).toBe(true);
    expect(spread(plan, [...ALL, 'custom-1'])).toBeLessThanOrEqual(1);
  });

  test('教科がすべてオフなら計画は空', () => {
    const settings = allSubjectsSettings();
    settings.subjects = settings.subjects.map((s) => ({ ...s, enabled: false }));
    expect(buildMonthPlan(settings, 2027, 2)).toEqual([]);
  });

  test('曜日ごとの回数どおりに枠ができる', () => {
    const settings = createDefaultSettings(); // 日0・平日2・土3
    const plan = buildPlan({ settings, from: '2027-02-01', to: '2027-02-07' });
    const perDay = eachDay('2027-02-01', '2027-02-07').map(
      (d) => plan.filter((s) => s.date === d).length,
    );
    expect(perDay).toEqual([2, 2, 2, 2, 2, 3, 0]);
  });

  test('お休みの日には枠がなく、残りの日で偏りなく振り分ける', () => {
    const settings = allSubjectsSettings();
    settings.restDays = ['2027-02-03', '2027-02-10'];
    const plan = buildMonthPlan(settings, 2027, 2);
    expect(plan.some((s) => settings.restDays.includes(s.date))).toBe(false);
    expect(plan).toHaveLength(52);
    expect(spread(plan, ALL)).toBeLessThanOrEqual(1);
  });

  test('教科数が1日の枠数より少ないときは、同じ日に重なってもよい', () => {
    const settings = allSubjectsSettings();
    settings.subjects = settings.subjects.map((s) => ({ ...s, enabled: s.id === 'sansu' }));
    const plan = buildPlan({ settings, from: '2027-02-01', to: '2027-02-01' });
    expect(plan.map((s) => s.subjectId)).toEqual(['sansu', 'sansu']);
  });
});

describe('buildPlan: 試験が近いとき', () => {
  test('試験の前は、その教科が多めに入る', () => {
    const settings = allSubjectsSettings();
    settings.exams = [{ subjectId: 'kanken', date: '2027-02-27', grade: '5級' }];
    const plan = buildMonthPlan(settings, 2027, 2);
    const counts = countBySubject(plan);
    const others = ALL.filter((id) => id !== 'kanken').map((id) => counts[id]);
    expect(counts.kanken).toBeGreaterThan(Math.max(...others));
  });

  test('試験の日以降は、ふつうの割合に戻る', () => {
    const settings = allSubjectsSettings();
    settings.exams = [{ subjectId: 'kanken', date: '2027-01-31', grade: '5級' }];
    const plan = buildMonthPlan(settings, 2027, 2);
    expect(countBySubject(plan).kanken).toBe(8);
  });
});
