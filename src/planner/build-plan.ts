import type { DateKey, PlannedSlot, PlanSettings, SubjectCounts, SubjectId } from '@/types/plan';
import { eachDay, monthRange, weekdayOf } from './dates';
import { subjectWeight } from './exam-weight';
import { AMOUNT_WEIGHT, enabledSubjectIds } from './subjects';

export interface BuildPlanInput {
  settings: PlanSettings;
  from: DateKey;
  to: DateKey;
  /** すでに勉強した回数（組み直しのときに、今月の実績を渡す） */
  initialCounts?: SubjectCounts;
  /** from の前日に勉強した教科（連続を避けるため） */
  previousDaySubjects?: readonly SubjectId[];
}

const EPSILON = 1e-9;

/**
 * 偏りのない計画を作る。
 *
 * 枠を日付順に1つずつ埋め、そのたびに「回数 ÷ 重み」がいちばん小さい教科を選ぶ。
 * - 重み ＝ 教科ごとの量（少なめ・ふつう・多め）× 試験前の重み
 * - 同じ日に同じ教科は入れない（教科数が1日の枠数より少ないときだけ重なる）
 * - 回数が同じなら、前の日にやっていない教科を優先する
 * - それでも同じなら、教科一覧の順番で決める（毎回同じ結果になる）
 */
export function buildPlan(input: BuildPlanInput): PlannedSlot[] {
  const { settings, from, to } = input;
  const subjects = enabledSubjectIds(settings.subjects);
  if (subjects.length === 0) return [];

  const counts: SubjectCounts = { ...input.initialCounts };
  for (const id of subjects) counts[id] ??= 0;

  const amountOf = new Map(
    settings.subjects.map((s) => [s.id, AMOUNT_WEIGHT[s.amount ?? 'normal']]),
  );
  const weightOf = (id: SubjectId, date: DateKey) =>
    (amountOf.get(id) ?? 1) * subjectWeight(id, date, settings.exams);

  const restDays = new Set(settings.restDays);
  let yesterday = new Set<SubjectId>(input.previousDaySubjects ?? []);
  const plan: PlannedSlot[] = [];

  for (const date of eachDay(from, to)) {
    const slots = restDays.has(date) ? 0 : (settings.slotsPerWeekday[weekdayOf(date)] ?? 0);
    const today = new Set<SubjectId>();

    for (let order = 0; order < slots; order++) {
      const subjectId = pickSubject(subjects, counts, today, yesterday, (id) => weightOf(id, date));
      plan.push({ date, order, subjectId });
      counts[subjectId] += 1;
      today.add(subjectId);
    }
    yesterday = today;
  }
  return plan;
}

function pickSubject(
  subjects: readonly SubjectId[],
  counts: SubjectCounts,
  today: ReadonlySet<SubjectId>,
  yesterday: ReadonlySet<SubjectId>,
  weightOf: (id: SubjectId) => number,
): SubjectId {
  const notToday = subjects.filter((id) => !today.has(id));
  const candidates = notToday.length > 0 ? notToday : subjects;

  let best = candidates[0];
  let bestScore = Infinity;
  let bestDidYesterday = true;
  for (const id of candidates) {
    const score = counts[id] / weightOf(id);
    const didYesterday = yesterday.has(id);
    const better =
      score < bestScore - EPSILON ||
      (Math.abs(score - bestScore) <= EPSILON && bestDidYesterday && !didYesterday);
    if (better) {
      best = id;
      bestScore = score;
      bestDidYesterday = didYesterday;
    }
  }
  return best;
}

/** month は 1〜12 */
export function buildMonthPlan(settings: PlanSettings, year: number, month: number): PlannedSlot[] {
  const { from, to } = monthRange(year, month);
  return buildPlan({ settings, from, to });
}

/** 計画から期間内（両端を含む）の枠だけを取り出す（週の表示などに使う） */
export function slotsInRange(plan: readonly PlannedSlot[], from: DateKey, to: DateKey): PlannedSlot[] {
  return plan.filter((s) => s.date >= from && s.date <= to);
}

/** 教科ごとの回数を数える */
export function countBySubject(items: readonly { subjectId: SubjectId }[]): SubjectCounts {
  const counts: SubjectCounts = {};
  for (const { subjectId } of items) counts[subjectId] = (counts[subjectId] ?? 0) + 1;
  return counts;
}
