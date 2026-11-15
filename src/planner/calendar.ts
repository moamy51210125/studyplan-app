import type { DateKey, PlannedSlot, PlanSettings, StudyRecord } from '@/types/plan';
import { buildMonthPlan } from './build-plan';
import { addDays, eachDay, monthRange } from './dates';
import { type IndexedRecord, monthKeyOf, todayStatus, type TodayItem } from './today';

export interface DayView {
  date: DateKey;
  isToday: boolean;
  /** 今日より前 */
  isPast: boolean;
  isRest: boolean;
  items: TodayItem[];
  extras: IndexedRecord[];
  planned: number;
  /** 予定のうち、できた数 */
  done: number;
}

export function dayView(
  plan: readonly PlannedSlot[],
  records: readonly StudyRecord[],
  restDays: readonly DateKey[],
  date: DateKey,
  today: DateKey,
): DayView {
  const status = todayStatus(plan, records, date);
  return {
    date,
    isToday: date === today,
    isPast: date < today,
    isRest: restDays.includes(date),
    items: status.items,
    extras: status.extras,
    planned: status.items.length,
    done: status.items.filter((i) => i.done !== null).length,
  };
}

/** 週（7日）の日付 */
export function weekDays(from: DateKey): DateKey[] {
  return eachDay(from, addDays(from, 6));
}

/**
 * カレンダーに表示する予定。
 * - 計画を作り終えた月は、保存されている予定を使う
 * - 今月より後で、まだ計画を作っていない月は、今の設定で組んだ「見こみ」を使う（preview）
 * - 今月より前で計画が無い月は、予定なし
 */
export function planForRange(
  plan: readonly PlannedSlot[],
  plannedMonths: readonly string[],
  settings: PlanSettings,
  from: DateKey,
  to: DateKey,
  today: DateKey,
): { slots: PlannedSlot[]; preview: boolean } {
  const months = [...new Set(eachDay(from, to).map(monthKeyOf))];
  const slots: PlannedSlot[] = [];
  let preview = false;

  for (const month of months) {
    const [y, m] = month.split('-').map(Number);
    const range = monthRange(y, m);
    if (plannedMonths.includes(month)) {
      slots.push(...plan.filter((s) => s.date >= range.from && s.date <= range.to));
    } else if (month > monthKeyOf(today)) {
      slots.push(...buildMonthPlan(settings, y, m));
      preview = true;
    }
  }
  return { slots: slots.filter((s) => s.date >= from && s.date <= to), preview };
}
