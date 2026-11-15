import { describe, expect, test } from '@jest/globals';
import type { PlanSettings, StudyRecord } from '@/types/plan';
import { buildMonthPlan, countBySubject } from '../build-plan';
import { createDefaultSettings } from '../defaults';
import { diffPlans, replan, reviewMissed } from '../replan';

const ALL = ['sansu', 'kokugo', 'rika', 'shakai', 'eigo', 'kanken', 'eiken'];

function allSubjectsSettings(): PlanSettings {
  const s = createDefaultSettings();
  return {
    ...s,
    subjects: s.subjects.map((x) => ({ ...x, enabled: true })),
    slotsPerWeekday: { 0: 2, 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2 },
  };
}

describe('replan: 予定と違う教科をしたとき', () => {
  const settings = allSubjectsSettings();
  const plan = buildMonthPlan(settings, 2027, 2);
  const today = '2027-02-01';
  const planned = plan.filter((s) => s.date === today).map((s) => s.subjectId);

  // 予定の1つめのかわりに「りか」をした（りかは今日の予定に無い）
  const records: StudyRecord[] = [
    { date: today, subjectId: 'rika' },
    { date: today, subjectId: planned[1] },
  ];

  test('前提：今日の予定に「りか」は無い', () => {
    expect(planned).not.toContain('rika');
  });

  const result = replan({ settings, currentPlan: plan, records, today });

  test('今日までの予定は変えない', () => {
    expect(result.plan.filter((s) => s.date <= today)).toEqual(
      plan.filter((s) => s.date <= today),
    );
  });

  test('実績と組み直した予定を合わせると、月の回数がそろう', () => {
    const future = result.plan.filter((s) => s.date > today);
    const total = countBySubject([...records, ...future]);
    expect(total).toEqual(Object.fromEntries(ALL.map((id) => [id, 8])));
  });

  test('変わる枠の一覧は、明日以降だけで、空ではない', () => {
    expect(result.changes.length).toBeGreaterThan(0);
    expect(result.changes.every((c) => c.date > today)).toBe(true);
  });

  test('予定どおりにやったなら、何も変わらない', () => {
    const asPlanned = planned.map((subjectId) => ({ date: today, subjectId }));
    expect(replan({ settings, currentPlan: plan, records: asPlanned, today }).changes).toEqual([]);
  });

  test('ほかの月の予定は変えない', () => {
    const march = buildMonthPlan(settings, 2027, 3);
    const r = replan({ settings, currentPlan: [...plan, ...march], records, today });
    expect(r.plan.filter((s) => s.date >= '2027-03-01')).toEqual(march);
  });

  test('月末の日に組み直しても、変わる枠はない', () => {
    const r = replan({ settings, currentPlan: plan, records: [], today: '2027-02-28' });
    expect(r.changes).toEqual([]);
  });
});

describe('reviewMissed: やらなかった予定の埋め合わせ', () => {
  const settings = allSubjectsSettings();
  const plan = buildMonthPlan(settings, 2027, 2);
  const day1 = plan.filter((s) => s.date === '2027-02-01').map((s) => s.subjectId);

  test('きのうの予定をやらなかったら、今日から月末で埋め合わせる', () => {
    // 2/1 は1つめだけやって、2つめはやらなかった
    const records: StudyRecord[] = [{ date: '2027-02-01', subjectId: day1[0] }];
    const r = reviewMissed({ settings, currentPlan: plan, records, today: '2027-02-02' });

    expect(r.changes.length).toBeGreaterThan(0);
    expect(r.changes.every((c) => c.date >= '2027-02-02')).toBe(true);
    const fromToday = r.plan.filter((s) => s.date >= '2027-02-02');
    const counts = countBySubject([...records, ...fromToday]);
    // 枠が1つ減った分、1教科だけ7回、ほかは8回
    expect(Object.values(counts).sort()).toEqual([7, 8, 8, 8, 8, 8, 8]);
    expect(counts[day1[1]]).toBe(8);
  });

  test('きのうまで予定どおりなら、何も変わらない', () => {
    const records = day1.map((subjectId) => ({ date: '2027-02-01', subjectId }));
    expect(reviewMissed({ settings, currentPlan: plan, records, today: '2027-02-02' }).changes).toEqual([]);
  });

  test('月が変わった日は、前の月の分を持ちこさない', () => {
    const march = buildMonthPlan(settings, 2027, 3);
    const r = reviewMissed({ settings, currentPlan: [...plan, ...march], records: [], today: '2027-03-01' });
    expect(r.changes).toEqual([]);
  });
});

describe('diffPlans', () => {
  test('変わった枠・増えた枠・なくなった枠を返す', () => {
    const before = [
      { date: '2027-02-02', order: 0, subjectId: 'sansu' },
      { date: '2027-02-02', order: 1, subjectId: 'kokugo' },
    ];
    const after = [
      { date: '2027-02-02', order: 0, subjectId: 'rika' },
      { date: '2027-02-03', order: 0, subjectId: 'kokugo' },
    ];
    expect(diffPlans(before, after)).toEqual([
      { date: '2027-02-02', order: 0, from: 'sansu', to: 'rika' },
      { date: '2027-02-02', order: 1, from: 'kokugo', to: null },
      { date: '2027-02-03', order: 0, from: null, to: 'kokugo' },
    ]);
  });
});
