import type { Subject, SubjectId } from '@/types/plan';

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
