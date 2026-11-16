import type { Subject, SubjectAmount, SubjectId } from '@/types/plan';

/**
 * 教科ごとの量の重み（ユーザー決定 2026-11-15）。
 * 少なめ＝ふつうの半分、多め＝ふつうの1.5倍の割合で計画に入る。
 */
export const AMOUNT_WEIGHT: Record<SubjectAmount, number> = {
  less: 0.5,
  normal: 1,
  more: 1.5,
};

/** 教科の量を変えた新しい一覧を返す */
export function setSubjectAmount(
  subjects: readonly Subject[],
  id: SubjectId,
  amount: SubjectAmount,
): Subject[] {
  return subjects.map((s) => (s.id === id ? { ...s, amount } : s));
}

/** 教科の一言を変えた新しい一覧を返す（空なら消す。予定には関係しない） */
export function setSubjectNote(subjects: readonly Subject[], id: SubjectId, note: string): Subject[] {
  const trimmed = note.trim();
  return subjects.map((s) => {
    if (s.id !== id) return s;
    const next = { ...s };
    if (trimmed === '') delete next.note;
    else next.note = trimmed;
    return next;
  });
}

/** 教科のオン・オフを切り替えた新しい一覧を返す */
export function setSubjectEnabled(
  subjects: readonly Subject[],
  id: SubjectId,
  enabled: boolean,
): Subject[] {
  return subjects.map((s) => (s.id === id ? { ...s, enabled } : s));
}

/** 自分で決めた教科を追加した新しい一覧を返す（最初からオン） */
export function addCustomSubject(subjects: readonly Subject[], label: string): Subject[] {
  const trimmed = label.trim();
  if (trimmed === '') throw new Error('教科の名前が空です');
  const used = new Set(subjects.map((s) => s.id));
  let n = 1;
  while (used.has(`custom-${n}`)) n++;
  return [...subjects, { id: `custom-${n}`, kind: 'custom', enabled: true, label: trimmed }];
}

export function enabledSubjectIds(subjects: readonly Subject[]): SubjectId[] {
  return subjects.filter((s) => s.enabled).map((s) => s.id);
}
