import type { DateKey, PlanChange, PlannedSlot, PlanSettings, StudyRecord } from '@/types/plan';
import { monthRangeOf } from './dates';
import { replan } from './replan';
import { monthKeyOf } from './today';

/** 保護者の確認を待っている予定の変更（子どもが「いいよ」を押したもの） */
export interface PendingApproval {
  /** 子どもが「いいよ」を押した日 */
  createdOn: DateKey;
  plan: PlannedSlot[];
  changes: PlanChange[];
}

/** 月が変わって、反映できなくなった確認待ちか */
export function isApprovalStale(pending: PendingApproval, today: DateKey): boolean {
  return monthKeyOf(pending.createdOn) !== monthKeyOf(today);
}

/**
 * 確認待ちの変更を反映した計画を返す。
 * 今日までの予定とほかの月の予定は今の計画のまま、今月の明日以降だけを差しかえる。
 * 月が変わっていたら反映できないので null。
 */
export function applyApproval(
  currentPlan: readonly PlannedSlot[],
  pending: PendingApproval,
  today: DateKey,
): PlannedSlot[] | null {
  if (isApprovalStale(pending, today)) return null;
  const month = monthRangeOf(today);
  const target = (s: PlannedSlot) => s.date > today && s.date <= month.to;
  return [...currentPlan.filter((s) => !target(s)), ...pending.plan.filter(target)].sort((x, y) =>
    x.date === y.date ? x.order - y.order : x.date < y.date ? -1 : 1,
  );
}

/**
 * 保護者が設定（教科のオン・オフ、曜日ごとの回数など）を変えたときに、
 * 明日から月末までの予定を新しい設定で作り直す。今日までの予定は変えない。
 */
export function applySettingsChange(
  settings: PlanSettings,
  currentPlan: readonly PlannedSlot[],
  records: readonly StudyRecord[],
  today: DateKey,
): PlannedSlot[] {
  return replan({ settings, currentPlan, records, today }).plan;
}
