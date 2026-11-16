import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Appearance } from '@/constants/theme';
import type { PendingApproval } from '@/planner/approval';
import type { Reward } from '@/planner/stamps';
import type {
  DateKey,
  DateRange,
  HomeworkCheck,
  HomeworkItem,
  PlannedSlot,
  PlanSettings,
  StudyRecord,
} from '@/types/plan';

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
  /** 保護者モードの設定（無ければ暗証番号は未設定・確認はオフ） */
  parent?: ParentSettings;
  /** 保護者の確認を待っている予定の変更（最新の1件だけ） */
  pendingApproval?: PendingApproval;
  /** 子どもの学年（1〜6）。未設定ならひらがな中心で表示する */
  grade?: number;
  /** 画面の色（未設定なら白） */
  appearance?: Appearance;
  /** 最後にバックアップを書き出した日 */
  lastBackupDate?: DateKey;
  /**
   * きのうまでに やらなかった予定の埋め合わせ（未設定は 'auto'。ユーザー決定 2026-11-16）
   * - auto: 子どもに聞かず、そっと組み直す（毎朝「できなかった」と出して責めないため）
   * - ask: その日はじめて開いたときに「こう かえても いい？」と聞く
   */
  missedReviewMode?: 'auto' | 'ask';
  /** 保存データがこわれていて、初期データで始め直した日（保護者に知らせる。閉じたら消す） */
  dataResetOn?: DateKey;
  /** 学校の宿題（月〜金に毎日出る。無ければ宿題わくは出さない） */
  homework?: HomeworkItem[];
  /** 宿題のチェック */
  homeworkChecks?: HomeworkCheck[];
  /** 学校のお休み（夏休みなど）。宿題を出さない（勉強の予定はそのまま） */
  schoolBreaks?: DateRange[];
  /** スタンプをもらった日（その日の予定と宿題がぜんぶできた日） */
  stamps?: DateKey[];
  /** ごほうび（無ければスタンプを子ども画面に出さない。任意） */
  reward?: Reward;
}

export interface ParentSettings {
  /** 暗証番号のハッシュ値とソルト（番号そのものは保存しない。src/parent/pin.ts） */
  pinHash: string;
  pinSalt: string;
  /** 子どもが「いいよ」を押した予定の変更を、保護者が確認してから反映するか */
  requireApproval: boolean;
}

const STORAGE_KEY = 'studyplan/app-data';
/** 読めなかったデータの控え（上書きで消さないように、別の場所に残す） */
export const BROKEN_KEY = 'studyplan/app-data-broken';

export type LoadResult =
  | { kind: 'ok'; data: AppData }
  /** はじめて使う（まだ何も保存されていない） */
  | { kind: 'empty' }
  /** 保存はあるが、こわれていて読めない（中身は BROKEN_KEY に控えた） */
  | { kind: 'broken' };

/** 文字列を読み、AppData として使えるか確かめる */
export function parseStoredText(raw: string | null): { kind: 'ok'; data: AppData } | { kind: 'empty' | 'broken' } {
  if (raw === null) return { kind: 'empty' };
  try {
    const data: unknown = JSON.parse(raw);
    return isAppData(data) ? { kind: 'ok', data } : { kind: 'broken' };
  } catch {
    return { kind: 'broken' };
  }
}

/**
 * 保存されたデータを読む。
 * - こわれていたら、元の文字列を BROKEN_KEY に控えてから 'broken' を返す（黙って上書きしない）
 * - 端末から読み出すこと自体に失敗したら、例外を投げる（呼び出し側は保存しないこと）
 */
export async function loadAppData(): Promise<LoadResult> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const result = parseStoredText(raw);
  if (result.kind === 'broken' && raw !== null) {
    await AsyncStorage.setItem(BROKEN_KEY, raw);
  }
  return result;
}

export async function saveAppData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function isAppData(x: unknown): x is AppData {
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
