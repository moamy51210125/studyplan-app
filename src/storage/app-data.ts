import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DateKey, PlannedSlot, PlanSettings, StudyRecord } from '@/types/plan';

/**
 * 端末の中に保存するデータ。端末の外には送らない（.claude/rules/child-privacy.md）。
 * 形を変えるときは version を上げ、古い形からの移しかえを用意する。
 */
export interface AppData {
  version: 1;
  settings: PlanSettings;
  plan: PlannedSlot[];
  /** 計画を作り終えた月（'YYYY-MM'） */
  plannedMonths: string[];
  records: StudyRecord[];
  /** 最後にアプリを開いた日（その日はじめて開いたときの見直しに使う） */
  lastOpenedDate?: DateKey;
}

const STORAGE_KEY = 'studyplan/app-data';

/** 保存されたデータを読む。無い・読めないときは null */
export async function loadAppData(): Promise<AppData | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw === null) return null;
  try {
    const data: unknown = JSON.parse(raw);
    return isAppData(data) ? data : null;
  } catch {
    return null;
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function isAppData(x: unknown): x is AppData {
  if (typeof x !== 'object' || x === null) return false;
  const d = x as Record<string, unknown>;
  return (
    d.version === 1 &&
    typeof d.settings === 'object' &&
    d.settings !== null &&
    Array.isArray(d.plan) &&
    Array.isArray(d.plannedMonths) &&
    Array.isArray(d.records)
  );
}
