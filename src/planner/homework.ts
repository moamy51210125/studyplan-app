import type { DateKey, HomeworkCheck, HomeworkItem } from '@/types/plan';
import { weekdayOf } from './dates';

/**
 * 学校の宿題わく（ユーザー決定 2026-11-15）。
 * - 宿題は保護者が子どもと相談して決め、月〜金に毎日出す
 * - お休みの日（体調不良・行事）には出さない
 * - 計画の枠とは別あつかいで、組み直しにも、ふりかえりの数にも入れない
 */
export const HOMEWORK_WEEKDAYS: readonly number[] = [1, 2, 3, 4, 5];

/** その日に出す宿題 */
export function homeworkForDay(
  items: readonly HomeworkItem[],
  date: DateKey,
  restDays: readonly DateKey[],
): HomeworkItem[] {
  if (!HOMEWORK_WEEKDAYS.includes(weekdayOf(date))) return [];
  if (restDays.includes(date)) return [];
  return [...items];
}

export function isHomeworkDone(checks: readonly HomeworkCheck[], date: DateKey, id: string): boolean {
  return checks.some((c) => c.date === date && c.homeworkId === id);
}

/** チェックを付ける／外す */
export function setHomeworkDone(
  checks: readonly HomeworkCheck[],
  date: DateKey,
  id: string,
  done: boolean,
): HomeworkCheck[] {
  const rest = checks.filter((c) => !(c.date === date && c.homeworkId === id));
  return done ? [...rest, { date, homeworkId: id }] : rest;
}

/** 宿題を足す（名前が空なら変えない） */
export function addHomework(items: readonly HomeworkItem[], label: string): HomeworkItem[] {
  const trimmed = label.trim();
  if (trimmed === '') return [...items];
  const used = new Set(items.map((h) => h.id));
  let n = 1;
  while (used.has(`hw-${n}`)) n++;
  return [...items, { id: `hw-${n}`, label: trimmed }];
}

/** 宿題を消す（その宿題のチェックも消す） */
export function removeHomework(
  items: readonly HomeworkItem[],
  checks: readonly HomeworkCheck[],
  id: string,
): { items: HomeworkItem[]; checks: HomeworkCheck[] } {
  return {
    items: items.filter((h) => h.id !== id),
    checks: checks.filter((c) => c.homeworkId !== id),
  };
}
