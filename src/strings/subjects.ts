import type { Subject } from '@/types/plan';

/**
 * 教科の表示名。
 * - kana: 低学年向け
 * - kanji: 子ども画面で漢字を使うときの表示名
 * - kanjiFromGrade: kanji を使い始める学年
 *   【仮・要確認】学年別漢字配当表で、その漢字を習った「次の学年」から漢字にしている
 *   （国・語・算・数・理・科・社・会は2年、英は4年、検は5年で習う、として設定）
 * - parent: 保護者画面での表示名
 */
export const SUBJECT_LABELS: Record<
  string,
  { kana: string; kanji: string; kanjiFromGrade: number; parent: string }
> = {
  sansu: { kana: 'さんすう', kanji: '算数', kanjiFromGrade: 3, parent: '算数' },
  kokugo: { kana: 'こくご', kanji: '国語', kanjiFromGrade: 3, parent: '国語' },
  rika: { kana: 'りか', kanji: '理科', kanjiFromGrade: 3, parent: '理科' },
  shakai: { kana: 'しゃかい', kanji: '社会', kanjiFromGrade: 3, parent: '社会' },
  eigo: { kana: 'えいご', kanji: '英語', kanjiFromGrade: 5, parent: '英語' },
  kanken: { kana: 'かんけん', kanji: '漢検', kanjiFromGrade: 6, parent: '漢検対策' },
  eiken: { kana: 'えいけん', kanji: '英検', kanjiFromGrade: 6, parent: '英検対策' },
};

/** 子ども画面の教科名（学年が未設定ならひらがな） */
export function subjectLabelForChild(subject: Subject, grade?: number): string {
  if (subject.kind === 'custom') return subject.label ?? '';
  const label = SUBJECT_LABELS[subject.id];
  if (!label) return subject.id;
  return grade !== undefined && grade >= label.kanjiFromGrade ? label.kanji : label.kana;
}

/** 保護者画面の教科名 */
export function subjectLabelForParent(subject: Subject): string {
  if (subject.kind === 'custom') return subject.label ?? '';
  return SUBJECT_LABELS[subject.id]?.parent ?? subject.id;
}

/** 子ども画面での級の表示（例：「準2級」→「じゅん2きゅう」） */
export function examGradeForChild(grade: string): string {
  return grade.replace(/準/g, 'じゅん').replace(/級/g, 'きゅう');
}
