import type { DateKey, HomeworkCheck, HomeworkItem, PlannedSlot, StudyRecord } from '@/types/plan';
import { isHomeworkDone } from './homework';
import { todayStatus } from './today';

/**
 * できた日のスタンプと、ごほうび（任意。ユーザー決定 2026-11-16）。
 * - その日の勉強の予定と宿題がぜんぶできたら、スタンプが1つ（1日1つまで）
 * - 予定も宿題も無い日は、スタンプは無し
 * - ごほうびは保護者が「スタンプ○こで□□」と決める。渡したら、そこから数え直す
 * - 他の人と比べる仕組みや、くじ（ガチャ）のような要素は入れない（.claude/rules/kid-friendly-ui.md）
 */
export interface Reward {
  /** スタンプいくつで、ごほうびか */
  goal: number;
  /** ごほうびの中身（例：すきな おやつ） */
  label: string;
  /** 最後にごほうびを渡したときまでに使ったスタンプの数（ここから数える） */
  base: number;
}

export const REWARD_GOAL_MIN = 3;
export const REWARD_GOAL_MAX = 30;
export const REWARD_GOAL_DEFAULT = 10;

/** 今日のスタンプを付ける／外す（「とりけす」で、ぜんぶできたではなくなったら外す） */
export function syncTodayStamp(stamps: readonly DateKey[], today: DateKey, earned: boolean): DateKey[] {
  const has = stamps.includes(today);
  if (earned && !has) return [...stamps, today].sort();
  if (!earned && has) return stamps.filter((d) => d !== today);
  return [...stamps];
}

export interface RewardProgress {
  /** 今たまっているスタンプ（ごほうびに向けて） */
  count: number;
  goal: number;
  /** あといくつ */
  left: number;
  reached: boolean;
}

export function rewardProgress(stampCount: number, reward: Reward): RewardProgress {
  const count = Math.max(0, stampCount - reward.base);
  return { count, goal: reward.goal, left: Math.max(0, reward.goal - count), reached: count >= reward.goal };
}

/** ごほうびを始める（今あるスタンプは数えず、0から始める） */
export function startReward(stampCount: number, goal: number, label: string): Reward {
  return { goal: clampGoal(goal), label: label.trim(), base: stampCount };
}

/** ごほうびを渡した（ゴールの分だけ使い、多い分は次に持ちこす） */
export function giveReward(reward: Reward): Reward {
  return { ...reward, base: reward.base + reward.goal };
}

export function clampGoal(goal: number): number {
  return Math.min(REWARD_GOAL_MAX, Math.max(REWARD_GOAL_MIN, Math.round(goal)));
}

/**
 * その日の勉強の予定と宿題が、ぜんぶできたか。
 * homework はその日に出す宿題（homeworkForDay の結果）。予定も宿題も無い日は false
 */
export function isDayComplete(
  plan: readonly PlannedSlot[],
  records: readonly StudyRecord[],
  homework: readonly HomeworkItem[],
  checks: readonly HomeworkCheck[],
  date: DateKey,
): boolean {
  const items = todayStatus(plan, records, date).items;
  if (items.length === 0 && homework.length === 0) return false;
  return items.every((i) => i.done !== null) && homework.every((h) => isHomeworkDone(checks, date, h.id));
}
