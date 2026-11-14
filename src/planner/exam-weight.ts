import type { DateKey, Exam, SubjectId } from '@/types/plan';
import { daysBetween } from './dates';

/**
 * 試験が近づいたときに、その教科の回数をどれだけ増やすか。
 * 【仮の値】根拠のある数字ではない。ユーザーに確認して決める。
 * withinDays 日前以内なら weight 倍の割合で入りやすくなる（小さい withinDays を先に書く）。
 */
export const EXAM_BOOST: readonly { withinDays: number; weight: number }[] = [
  { withinDays: 14, weight: 2 },
  { withinDays: 30, weight: 1.5 },
];

/** その日のその教科の重み（ふつうは 1。試験の前だけ大きくなり、試験の日以降は 1 に戻る） */
export function subjectWeight(subjectId: SubjectId, date: DateKey, exams: readonly Exam[]): number {
  let weight = 1;
  for (const exam of exams) {
    if (exam.subjectId !== subjectId) continue;
    const left = daysBetween(date, exam.date);
    if (left <= 0) continue;
    const boost = EXAM_BOOST.find((b) => left <= b.withinDays);
    if (boost) weight = Math.max(weight, boost.weight);
  }
  return weight;
}

/** 試験まであと何日か（過ぎていたら 0） */
export function daysUntilExam(today: DateKey, exam: Exam): number {
  return Math.max(0, daysBetween(today, exam.date));
}
