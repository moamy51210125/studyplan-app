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

/** 初期設定（曜日ごとの回数はユーザー決定 2026-11-15。初回起動の「1日の回数」で調整できる） */
export function createDefaultSettings(): PlanSettings {
  return {
    subjects: DEFAULT_SUBJECTS.map((s) => ({ ...s })),
    // 日曜 0 回、平日 1 回、土曜 2 回
    slotsPerWeekday: { 0: 0, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 2 },
    restDays: [],
    exams: [],
  };
}
