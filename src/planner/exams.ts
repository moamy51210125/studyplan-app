import type { DateKey, Exam, PlanSettings } from '@/types/plan';
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
