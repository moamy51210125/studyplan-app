import type { PlanSettings, Subject } from '@/types/plan';

/**
 * 最初から用意する教科。
 * 検定対策は受ける人だけが使うので、最初はオフにしておく。
 */
export const DEFAULT_SUBJECTS: readonly Subject[] = [
  { id: 'sansu', kind: 'core', enabled: true },
  { id: 'kokugo', kind: 'core', enabled: true },
  { id: 'rika', kind: 'core', enabled: true },
  { id: 'shakai', kind: 'core', enabled: true },
  { id: 'eigo', kind: 'core', enabled: true },
  { id: 'kanken', kind: 'exam', enabled: false },
  { id: 'eiken', kind: 'exam', enabled: false },
];

/** 初期設定（曜日ごとの回数は仮の値。ユーザー確認待ち） */
export function createDefaultSettings(): PlanSettings {
  return {
    subjects: DEFAULT_SUBJECTS.map((s) => ({ ...s })),
    // 日曜 0 回、平日 2 回、土曜 3 回（仮）
    slotsPerWeekday: { 0: 0, 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 3 },
    restDays: [],
    exams: [],
  };
}
