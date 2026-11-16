import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Appearance } from '@/constants/theme';
import type { PendingApproval } from '@/planner/approval';
import { createDefaultSettings } from '@/planner/defaults';
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
 *
 * version 2（2026-11-16）：きょうだいで使えるように、家族で1つの FamilyData に
 * 子どもごとのデータ（ChildProfile）をならべる。暗証番号・画面の色・バックアップは家族で共通。
 * 子どもについて保存する個人情報はニックネームだけ（ユーザー決定）。
 */

/** 子どもごとのデータ */
export interface ChildData {
  settings: PlanSettings;
  plan: PlannedSlot[];
  /** 計画を作り終えた月（'YYYY-MM'） */
  plannedMonths: string[];
  records: StudyRecord[];
  /** 最後にアプリを開いた日（その日はじめて開いたときの見直しに使う） */
  lastOpenedDate?: DateKey;
  /** 保護者の確認を待っている予定の変更（最新の1件だけ） */
  pendingApproval?: PendingApproval;
  /** 子どもの学年（1〜6）。未設定ならひらがな中心で表示する */
  grade?: number;
  /**
   * きのうまでに やらなかった予定の埋め合わせ（未設定は 'auto'。ユーザー決定 2026-11-16）
   * - auto: 子どもに聞かず、そっと組み直す（毎朝「できなかった」と出して責めないため）
   * - ask: その日はじめて開いたときに「こう かえても いい？」と聞く
   */
  missedReviewMode?: 'auto' | 'ask';
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

/** 家族で共通のデータ */
export interface FamilyShared {
  /** 保護者モードの設定（無ければ暗証番号は未設定・確認はオフ） */
  parent?: ParentSettings;
  /** 画面の色（未設定なら白） */
  appearance?: Appearance;
  /** 最後にバックアップを書き出した日 */
  lastBackupDate?: DateKey;
  /** 保存データがこわれていて、初期データで始め直した日（保護者に知らせる。閉じたら消す） */
  dataResetOn?: DateKey;
}

const FAMILY_KEYS = ['parent', 'appearance', 'lastBackupDate', 'dataResetOn'] as const;

/**
 * 画面で使う形：今使っている子どものデータ＋家族で共通のデータ。
 * 画面はこれを読み書きし、保存のときに子どもごと・家族共通に分けなおす（applyView）。
 */
export type AppData = ChildData & FamilyShared;

export interface ChildProfile extends ChildData {
  id: string;
  /** ニックネーム（本名でなくてよい。空なら「1にんめ」のように出す） */
  nickname: string;
}

export interface FamilyData extends FamilyShared {
  version: 2;
  children: ChildProfile[];
  /** 今使っている子ども */
  activeChildId: string;
}

export interface ParentSettings {
  /** 暗証番号のハッシュ値とソルト（番号そのものは保存しない。src/parent/pin.ts） */
  pinHash: string;
  pinSalt: string;
  /** 子どもが「いいよ」を押した予定の変更を、保護者が確認してから反映するか */
  requireApproval: boolean;
}

export const MAX_CHILDREN = 6;
export const MAX_NICKNAME = 10;

/** 新しい子どものデータ（初期設定から） */
export function createChild(id: string, nickname: string): ChildProfile {
  return {
    id,
    nickname: nickname.trim().slice(0, MAX_NICKNAME),
    settings: createDefaultSettings(),
    plan: [],
    plannedMonths: [],
    records: [],
  };
}

export function createEmptyFamily(): FamilyData {
  const child = createChild('child-1', '');
  return { version: 2, children: [child], activeChildId: child.id };
}

/** まだ使っていない子どもの id */
export function newChildId(family: FamilyData): string {
  const used = new Set(family.children.map((c) => c.id));
  let n = 1;
  while (used.has(`child-${n}`)) n++;
  return `child-${n}`;
}

export function activeChild(family: FamilyData): ChildProfile {
  return family.children.find((c) => c.id === family.activeChildId) ?? family.children[0];
}

/** 画面で使う形にする（今の子ども＋家族共通） */
export function viewOf(family: FamilyData): AppData {
  const { id: _id, nickname: _nickname, ...child } = activeChild(family);
  const shared: FamilyShared = {};
  for (const k of FAMILY_KEYS) if (family[k] !== undefined) Object.assign(shared, { [k]: family[k] });
  return { ...child, ...shared };
}

/** 画面で変えたデータを、子どもごと・家族共通に分けて戻す */
export function applyView(family: FamilyData, view: AppData): FamilyData {
  const shared: Record<string, unknown> = {};
  const child: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(view)) {
    if ((FAMILY_KEYS as readonly string[]).includes(k)) shared[k] = v;
    else child[k] = v;
  }
  const current = activeChild(family);
  const children = family.children.map((c) =>
    c.id === current.id ? ({ ...(child as unknown as ChildData), id: c.id, nickname: c.nickname } as ChildProfile) : c,
  );
  const next: FamilyData = { version: 2, children, activeChildId: current.id };
  for (const k of FAMILY_KEYS) if (shared[k] !== undefined) Object.assign(next, { [k]: shared[k] });
  return next;
}

/** 子どもごとの部分として使えるか */
function isChildData(x: unknown): x is ChildData {
  if (typeof x !== 'object' || x === null) return false;
  const d = x as Record<string, unknown>;
  return (
    typeof d.settings === 'object' &&
    d.settings !== null &&
    Array.isArray(d.plan) &&
    Array.isArray(d.plannedMonths) &&
    Array.isArray(d.records)
  );
}

/**
 * 保存されていた形（version 1 の1人分、または version 2 の家族）を FamilyData にする。
 * version 1 は、そのまま1人目の子どもとして引きつぐ。使えない形なら null
 */
export function toFamily(x: unknown): FamilyData | null {
  if (typeof x !== 'object' || x === null) return null;
  const d = x as Record<string, unknown>;
  if (d.version === 1 && isChildData(d)) {
    const { version: _v, ...rest } = d;
    const shared: Record<string, unknown> = {};
    const child: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rest)) {
      if ((FAMILY_KEYS as readonly string[]).includes(k)) shared[k] = v;
      else child[k] = v;
    }
    const profile = { ...(child as unknown as ChildData), id: 'child-1', nickname: '' };
    return { ...(shared as FamilyShared), version: 2, children: [profile], activeChildId: profile.id };
  }
  if (
    d.version === 2 &&
    Array.isArray(d.children) &&
    d.children.length > 0 &&
    d.children.every((c: unknown) => isChildData(c) && typeof (c as { id?: unknown }).id === 'string') &&
    typeof d.activeChildId === 'string'
  ) {
    const family = x as FamilyData;
    // 今の子どもが見つからなければ、1人目にする
    const exists = family.children.some((c) => c.id === family.activeChildId);
    return {
      ...family,
      children: family.children.map((c) => ({ ...c, nickname: typeof c.nickname === 'string' ? c.nickname : '' })),
      activeChildId: exists ? family.activeChildId : family.children[0].id,
    };
  }
  return null;
}

const STORAGE_KEY = 'studyplan/app-data';
/** 読めなかったデータの控え（上書きで消さないように、別の場所に残す） */
export const BROKEN_KEY = 'studyplan/app-data-broken';

export type LoadResult =
  | { kind: 'ok'; family: FamilyData }
  /** はじめて使う（まだ何も保存されていない） */
  | { kind: 'empty' }
  /** 保存はあるが、こわれていて読めない（中身は BROKEN_KEY に控えた） */
  | { kind: 'broken' };

/** 保存されていた文字列を読み、使えるか確かめる */
export function parseStoredText(raw: string | null): LoadResult {
  if (raw === null) return { kind: 'empty' };
  try {
    const family = toFamily(JSON.parse(raw));
    return family ? { kind: 'ok', family } : { kind: 'broken' };
  } catch {
    return { kind: 'broken' };
  }
}

/**
 * 保存されたデータを読む。
 * - こわれていたら、元の文字列を BROKEN_KEY に控えてから 'broken' を返す（黙って上書きしない）
 * - 端末から読み出すこと自体に失敗したら、例外を投げる（呼び出し側は保存しないこと）
 */
export async function loadFamily(): Promise<LoadResult> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const result = parseStoredText(raw);
  if (result.kind === 'broken' && raw !== null) {
    await AsyncStorage.setItem(BROKEN_KEY, raw);
  }
  return result;
}

export async function saveFamily(family: FamilyData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(family));
}
