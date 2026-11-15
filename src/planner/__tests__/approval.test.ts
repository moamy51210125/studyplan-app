import { describe, expect, test } from '@jest/globals';
import type { PlanSettings } from '@/types/plan';
import { applyApproval, applySettingsChange, isApprovalStale } from '../approval';
import { buildMonthPlan, countBySubject } from '../build-plan';
import { createDefaultSettings } from '../defaults';
import { replan } from '../replan';
import { setSubjectEnabled } from '../subjects';

function settings7(): PlanSettings {
  const s = createDefaultSettings();
  return {
    ...s,
    subjects: s.subjects.map((x) => ({ ...x, enabled: true })),
    slotsPerWeekday: { 0: 2, 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2 },
  };
}

describe('applyApproval: 確認待ちの反映', () => {
  const settings = settings7();
  const plan = buildMonthPlan(settings, 2027, 2);
  const records = [{ date: '2027-02-01', subjectId: 'rika' }];
  const proposal = replan({ settings, currentPlan: plan, records, today: '2027-02-01' });
  const pending = { createdOn: '2027-02-01', plan: proposal.plan, changes: proposal.changes };

  test('同じ日に反映すると、案のとおりになる', () => {
    expect(applyApproval(plan, pending, '2027-02-01')).toEqual(proposal.plan);
  });

  test('あとの日に反映しても、その日までの予定は変えない', () => {
    const merged = applyApproval(plan, pending, '2027-02-05')!;
    expect(merged.filter((s) => s.date <= '2027-02-05')).toEqual(
      plan.filter((s) => s.date <= '2027-02-05'),
    );
    expect(merged.filter((s) => s.date > '2027-02-05')).toEqual(
      proposal.plan.filter((s) => s.date > '2027-02-05'),
    );
  });

  test('月が変わったら反映できない', () => {
    expect(isApprovalStale(pending, '2027-03-01')).toBe(true);
    expect(applyApproval(plan, pending, '2027-03-01')).toBeNull();
  });
});

describe('applySettingsChange: 設定を変えたときの作り直し', () => {
  test('教科をオフにすると、明日からその教科が消え、今日までは変わらない', () => {
    const before = settings7();
    const plan = buildMonthPlan(before, 2027, 2);
    const after = { ...before, subjects: setSubjectEnabled(before.subjects, 'shakai', false) };
    const next = applySettingsChange(after, plan, [], '2027-02-10');

    expect(next.filter((s) => s.date <= '2027-02-10')).toEqual(plan.filter((s) => s.date <= '2027-02-10'));
    expect(next.some((s) => s.date > '2027-02-10' && s.subjectId === 'shakai')).toBe(false);
  });

  test('曜日ごとの回数を変えると、明日からの枠の数が変わる', () => {
    const before = settings7();
    const plan = buildMonthPlan(before, 2027, 2);
    const after = { ...before, slotsPerWeekday: { ...before.slotsPerWeekday, 3: 0 } }; // 水曜 0 回
    const next = applySettingsChange(after, plan, [], '2027-02-01');
    expect(next.some((s) => s.date === '2027-02-03')).toBe(false); // 2/3 は水曜
    expect(Object.keys(countBySubject(next)).length).toBe(7);
  });
});
