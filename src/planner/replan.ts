import type { DateKey, PlanChange, PlannedSlot, PlanSettings, StudyRecord } from '@/types/plan';
import { buildPlan, countBySubject } from './build-plan';
import { addDays, monthRangeOf } from './dates';

export interface ReplanInput {
  settings: PlanSettings;
  currentPlan: readonly PlannedSlot[];
  /** 実際に勉強した記録（予定と違う教科も含む） */
  records: readonly StudyRecord[];
  today: DateKey;
}

export interface ReplanResult {
  plan: PlannedSlot[];
  /** 変わる枠の一覧。子ども（と保護者）に「こう変えるよ」と見せるために使う */
  changes: PlanChange[];
}

/**
 * 今月の実績をもとに、明日から月末までの計画を組み直す。
 *
 * - 今日までの枠と、ほかの月の枠は変えない
 * - 今月1日〜今日の「実際にやった記録」を数え、足りない教科が後で多く入るようにする
 * - この関数は案を作るだけ。反映するかどうかは画面側で確認してから決める
 */
export function replan({ settings, currentPlan, records, today }: ReplanInput): ReplanResult {
  const month = monthRangeOf(today);
  const tomorrow = addDays(today, 1);

  const kept = currentPlan.filter((s) => s.date < tomorrow || s.date > month.to);
  const monthRecords = records.filter((r) => r.date >= month.from && r.date <= today);
  const future =
    tomorrow <= month.to
      ? buildPlan({
          settings,
          from: tomorrow,
          to: month.to,
          initialCounts: countBySubject(monthRecords),
          previousDaySubjects: monthRecords.filter((r) => r.date === today).map((r) => r.subjectId),
        })
      : [];

  const plan = sortSlots([...kept, ...future]);
  return { plan, changes: diffPlans(currentPlan, plan) };
}

/** 2つの計画を比べて、変わった枠を返す */
export function diffPlans(before: readonly PlannedSlot[], after: readonly PlannedSlot[]): PlanChange[] {
  const key = (s: PlannedSlot) => `${s.date}#${s.order}`;
  const beforeMap = new Map(before.map((s) => [key(s), s]));
  const afterMap = new Map(after.map((s) => [key(s), s]));

  const changes: PlanChange[] = [];
  for (const k of new Set([...beforeMap.keys(), ...afterMap.keys()])) {
    const b = beforeMap.get(k);
    const a = afterMap.get(k);
    if (b?.subjectId === a?.subjectId) continue;
    const slot = (a ?? b)!;
    changes.push({
      date: slot.date,
      order: slot.order,
      from: b?.subjectId ?? null,
      to: a?.subjectId ?? null,
    });
  }
  return sortSlots(changes);
}

function sortSlots<T extends { date: DateKey; order: number }>(items: T[]): T[] {
  return items.sort((x, y) => (x.date === y.date ? x.order - y.order : x.date < y.date ? -1 : 1));
}
