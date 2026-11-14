import type { Subject } from '@/types/plan';

/**
 * 教科の表示名。kana は低学年向け、kanji は漢字を使える学年・保護者画面向け。
 * 学年による切り替えは「学年の設定」機能で行う予定。
 */
export const SUBJECT_LABELS: Record<string, { kana: string; kanji: string }> = {
  sansu: { kana: 'さんすう', kanji: '算数' },
  kokugo: { kana: 'こくご', kanji: '国語' },
  rika: { kana: 'りか', kanji: '理科' },
  shakai: { kana: 'しゃかい', kanji: '社会' },
  eigo: { kana: 'えいご', kanji: '英語' },
  kanken: { kana: 'かんけん', kanji: '漢検対策' },
  eiken: { kana: 'えいけん', kanji: '英検対策' },
};

export function subjectLabel(subject: Subject, useKanji: boolean): string {
  if (subject.kind === 'custom') return subject.label ?? '';
  const label = SUBJECT_LABELS[subject.id];
  if (!label) return subject.id;
  return useKanji ? label.kanji : label.kana;
}
