import type { Subject } from '@/types/plan';

import { resolveMarkup } from './ruby';

/**
 * 教科の表示名。
 * - child: 子ども画面の表示名。「{漢字|よみ|漢字にする学年}」の印付き（src/strings/ruby.ts）
 *   - 算数・国語・理科・社会：2年生で習う漢字なので、2年生はふりがな付き、3年生から漢字だけ
 *   - 英語：英は4年生で習うので、次の5年生から漢字
 *   - 漢検・英検：ユーザーの決定（2026-11-15）で3年生から漢字
 * - parent: 保護者画面での表示名
 */
export const SUBJECT_LABELS: Record<string, { child: string; parent: string }> = {
  sansu: { child: '{算数|さんすう|2}', parent: '算数' },
  kokugo: { child: '{国語|こくご|2}', parent: '国語' },
  rika: { child: '{理科|りか|2}', parent: '理科' },
  shakai: { child: '{社会|しゃかい|2}', parent: '社会' },
  eigo: { child: '{英語|えいご|5}', parent: '英語' },
  kanken: { child: '{漢検|かんけん|3}', parent: '漢検対策' },
  eiken: { child: '{英検|えいけん|3}', parent: '英検対策' },
};

/** 自分で入力した名前から、ふりがなの印に使う記号を取りのぞく */
function cleanCustom(label: string | undefined): string {
  return (label ?? '').replace(/[{}|]/g, '');
}

/** 子ども画面の教科名（学年が未設定ならひらがな、1〜2年生はふりがな付きの印） */
export function subjectLabelForChild(subject: Subject, grade?: number): string {
  if (subject.kind === 'custom') return cleanCustom(subject.label);
  const label = SUBJECT_LABELS[subject.id];
  if (!label) return subject.id;
  return resolveMarkup(label.child, grade);
}

/** 保護者画面の教科名 */
export function subjectLabelForParent(subject: Subject): string {
  if (subject.kind === 'custom') return cleanCustom(subject.label);
  return SUBJECT_LABELS[subject.id]?.parent ?? subject.id;
}

/** 子ども画面での級の表示（例：「準2級」→「じゅん2きゅう」） */
export function examGradeForChild(grade: string): string {
  return grade.replace(/準/g, 'じゅん').replace(/級/g, 'きゅう');
}
