import type { DateKey, DateRange, Exam, PlanSettings } from '@/types/plan';
import { eachDay } from './dates';
import { setSubjectEnabled } from './subjects';

function sameExam(a: Exam, b: Exam): boolean {
  return a.subjectId === b.subjectId && a.date === b.date && a.grade === b.grade;
}

/** 試験を追加する。試験の教科は計画に入れる（オンにする）。同じ試験は二重に追加しない */
export function addExam(settings: PlanSettings, exam: Exam): PlanSettings {
  const grade = exam.grade.trim();
  const next = { ...exam, grade };
  if (settings.exams.some((e) => sameExam(e, next))) return settings;
  return {
    ...settings,
    subjects: setSubjectEnabled(settings.subjects, exam.subjectId, true),
    exams: [...settings.exams, next].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)),
  };
}

export function removeExam(settings: PlanSettings, exam: Exam): PlanSettings {
  return { ...settings, exams: settings.exams.filter((e) => !sameExam(e, exam)) };
}

/** 今日以降の試験（日付順） */
export function upcomingExams(exams: readonly Exam[], today: DateKey): Exam[] {
  return exams.filter((e) => e.date >= today).sort((a, b) => (a.date < b.date ? -1 : 1));
}

/** お休みの日を切り替える */
export function toggleRestDay(settings: PlanSettings, date: DateKey): PlanSettings {
  const restDays = settings.restDays.includes(date)
    ? settings.restDays.filter((d) => d !== date)
    : [...settings.restDays, date].sort();
  return { ...settings, restDays };
}

/** from と to の順番をそろえる（後の日を先にえらんでもよいように） */
export function orderedRange(a: DateKey, b: DateKey): DateRange {
  return a <= b ? { from: a, to: b } : { from: b, to: a };
}

/**
 * 期間をまとめてお休みにする。
 * 期間の日がすでにすべてお休みなら、まとめてお休みを外す（もう一度えらぶと元に戻せる）。
 */
export function toggleRestRange(settings: PlanSettings, range: DateRange): { settings: PlanSettings; added: boolean } {
  const days = eachDay(range.from, range.to);
  const current = new Set(settings.restDays);
  const allRest = days.every((d) => current.has(d));
  if (allRest) days.forEach((d) => current.delete(d));
  else days.forEach((d) => current.add(d));
  return { settings: { ...settings, restDays: [...current].sort() }, added: !allRest };
}
