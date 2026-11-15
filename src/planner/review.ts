import type { DateKey, Mood, PlannedSlot, StudyRecord, SubjectId } from '@/types/plan';
import { eachDay } from './dates';
import { todayStatus } from './today';

export interface SubjectSummary {
  subjectId: SubjectId;
  /** 予定の回数 */
  planned: number;
  /** 実際にやった回数（予定に無かった分もふくむ） */
  studied: number;
  moods: Record<Mood, number>;
}

export interface ReviewSummary {
  /** 期間内の予定の数 */
  planned: number;
  /** そのうち、できた数 */
  doneOfPlanned: number;
  /** 教科ごと（subjectOrder の順。期間内に予定も記録も無い教科はふくめない） */
  subjects: SubjectSummary[];
}

/** from〜to（両端をふくむ）のふり返り */
export function summarize(
  plan: readonly PlannedSlot[],
  records: readonly StudyRecord[],
  from: DateKey,
  to: DateKey,
  subjectOrder: readonly SubjectId[],
): ReviewSummary {
  const bySubject = new Map<SubjectId, SubjectSummary>();
  const get = (subjectId: SubjectId) => {
    let s = bySubject.get(subjectId);
    if (!s) {
      s = { subjectId, planned: 0, studied: 0, moods: { good: 0, ok: 0, hard: 0 } };
      bySubject.set(subjectId, s);
    }
    return s;
  };

  let planned = 0;
  let doneOfPlanned = 0;
  for (const date of eachDay(from, to)) {
    for (const item of todayStatus(plan, records, date).items) {
      planned += 1;
      get(item.slot.subjectId).planned += 1;
      if (item.done) doneOfPlanned += 1;
    }
  }
  for (const r of records) {
    if (r.date < from || r.date > to) continue;
    const s = get(r.subjectId);
    s.studied += 1;
    if (r.mood) s.moods[r.mood] += 1;
  }

  const rank = (id: SubjectId) => {
    const i = subjectOrder.indexOf(id);
    return i === -1 ? subjectOrder.length : i;
  };
  const subjects = [...bySubject.values()].sort((a, b) => rank(a.subjectId) - rank(b.subjectId));
  return { planned, doneOfPlanned, subjects };
}
