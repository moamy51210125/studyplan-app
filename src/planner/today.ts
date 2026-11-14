import type { DateKey, PlannedSlot, PlanSettings, StudyRecord, SubjectId } from '@/types/plan';
import { buildMonthPlan } from './build-plan';

export interface TodayItem {
  slot: PlannedSlot;
  done: boolean;
}

export interface TodayStatus {
  /** 今日の予定（順番どおり）と、できたかどうか */
  items: TodayItem[];
  /** 予定に無かったけれど、やった記録 */
  extras: StudyRecord[];
  /** 予定がすべてできたか（予定が無い日は false） */
  allDone: boolean;
}

/**
 * 今日の予定と記録を突き合わせる。
 * 同じ教科の記録は1回分ずつ予定に割り当て、あまった記録は extras に入れる。
 */
export function todayStatus(
  plan: readonly PlannedSlot[],
  records: readonly StudyRecord[],
  date: DateKey,
): TodayStatus {
  const remaining = records.filter((r) => r.date === date);
  const slots = plan.filter((s) => s.date === date).sort((a, b) => a.order - b.order);

  const items = slots.map((slot) => {
    const i = remaining.findIndex((r) => r.subjectId === slot.subjectId);
    if (i === -1) return { slot, done: false };
    remaining.splice(i, 1);
    return { slot, done: true };
  });

  return {
    items,
    extras: remaining,
    allDone: items.length > 0 && items.every((item) => item.done),
  };
}

/** 記録を1つ足した新しい一覧を返す */
export function addRecord(
  records: readonly StudyRecord[],
  date: DateKey,
  subjectId: SubjectId,
): StudyRecord[] {
  return [...records, { date, subjectId }];
}

/** その日のその教科の記録を1つだけ取り消した新しい一覧を返す（最後に足したものから消す） */
export function removeRecord(
  records: readonly StudyRecord[],
  date: DateKey,
  subjectId: SubjectId,
): StudyRecord[] {
  let index = -1;
  records.forEach((r, i) => {
    if (r.date === date && r.subjectId === subjectId) index = i;
  });
  if (index === -1) return [...records];
  return [...records.slice(0, index), ...records.slice(index + 1)];
}

/** 'YYYY-MM' */
export function monthKeyOf(date: DateKey): string {
  return date.slice(0, 7);
}

/** その日の月の計画がまだ無ければ作って足す */
export function ensureMonthPlan(
  settings: PlanSettings,
  plan: readonly PlannedSlot[],
  plannedMonths: readonly string[],
  date: DateKey,
): { plan: PlannedSlot[]; plannedMonths: string[] } {
  const month = monthKeyOf(date);
  if (plannedMonths.includes(month)) return { plan: [...plan], plannedMonths: [...plannedMonths] };
  const [year, m] = month.split('-').map(Number);
  return {
    plan: [...plan, ...buildMonthPlan(settings, year, m)],
    plannedMonths: [...plannedMonths, month],
  };
}

/** date より後で、予定がある最初の日の予定（無ければ空） */
export function nextStudyDay(plan: readonly PlannedSlot[], date: DateKey): PlannedSlot[] {
  const next = plan
    .filter((s) => s.date > date)
    .reduce<DateKey | null>((min, s) => (min === null || s.date < min ? s.date : min), null);
  if (next === null) return [];
  return plan.filter((s) => s.date === next).sort((a, b) => a.order - b.order);
}
