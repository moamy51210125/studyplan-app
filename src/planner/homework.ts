import type { DateKey, DateRange, HomeworkCheck, HomeworkItem } from '@/types/plan';
import { weekdayOf } from './dates';

/**
 * 学校の宿題わく（ユーザー決定 2026-11-15）。
 * - 宿題は保護者が子どもと相談して決め、月〜金に毎日出す
 * - お休みの日（体調不良・行事）と、学校のお休み（夏休みなど）には出さない
 *   学校のお休みは宿題を出さないだけで、勉強の予定はそのまま
 * - 計画の枠とは別あつかいで、組み直しにも、ふりかえりの数にも入れない
 */
export const HOMEWORK_WEEKDAYS: readonly number[] = [1, 2, 3, 4, 5];

/** その日に出す宿題 */
export function homeworkForDay(
  items: readonly HomeworkItem[],
  date: DateKey,
  restDays: readonly DateKey[],
  schoolBreaks: readonly DateRange[] = [],
): HomeworkItem[] {
  if (!HOMEWORK_WEEKDAYS.includes(weekdayOf(date))) return [];
  if (restDays.includes(date)) return [];
  if (isInRanges(date, schoolBreaks)) return [];
  return [...items];
}

export function isInRanges(date: DateKey, ranges: readonly DateRange[]): boolean {
  return ranges.some((r) => r.from <= date && date <= r.to);
}

/** 学校のお休みを足す（日付順） */
export function addSchoolBreak(breaks: readonly DateRange[], range: DateRange): DateRange[] {
  if (breaks.some((b) => b.from === range.from && b.to === range.to)) return [...breaks];
  return [...breaks, range].sort((a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : 0));
}

export function removeSchoolBreak(breaks: readonly DateRange[], range: DateRange): DateRange[] {
  return breaks.filter((b) => !(b.from === range.from && b.to === range.to));
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
