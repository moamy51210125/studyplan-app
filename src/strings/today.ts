import { weekdayOf } from '@/planner/dates';
import type { DateKey } from '@/types/plan';

import { kanaOnly, markDateDay, markDayCount, resolveMarkup } from './ruby';

/**
 * 子ども画面の文言。
 * 漢字には「{漢字|よみ|習う学年}」の印を付ける（src/strings/ruby.ts）。
 * todayText(grade) で、学年に合わせて「ひらがな／ふりがな付き／漢字だけ」に変える。
 * 表示は必ず RubyText（src/components/ruby-text.tsx）か BigButton を使う。
 * 分かち書き（ことばの間の空白）は、ひらがなで読みやすいように入れる。
 */

const WEEKDAYS = [
  '{日|にち|1}{曜|よう|2}{日|び|1}',
  '{月|げつ|1}{曜|よう|2}{日|び|1}',
  '{火|か|1}{曜|よう|2}{日|び|1}',
  '{水|すい|1}{曜|よう|2}{日|び|1}',
  '{木|もく|1}{曜|よう|2}{日|び|1}',
  '{金|きん|1}{曜|よう|2}{日|び|1}',
  '{土|ど|1}{曜|よう|2}{日|び|1}',
];
const WEEKDAYS_SHORT = [
  '{日|にち|1}',
  '{月|げつ|1}',
  '{火|か|1}',
  '{水|すい|1}',
  '{木|もく|1}',
  '{金|きん|1}',
  '{土|ど|1}',
];

function monthAndDay(date: DateKey): [number, number] {
  const [, m, d] = date.split('-').map(Number);
  return [m, d];
}

const MARKED = {
  title: '{今日|きょう|2}の やること',
  loading: 'じゅんびちゅう…',
  doneButton: 'できた！',
  doneBadge: 'できたね！',
  undo: 'とりけす',
  allDone: 'ぜんぶ できたね！ すごい！',
  noPlanToday: '{今日|きょう|2}は べん{強|きょう|2}の よていは ないよ。ゆっくり {休|やす|1}もう！',
  nextPlan: (date: string) => `つぎは ${date} だよ`,
  otherSubjectButton: 'ちがう {教科|きょうか|2}を やった',
  extrasTitle: 'ほかに やった {教科|きょうか|2}',
  pickerTitle: 'どの {教科|きょうか|2}を やったかな？',
  cancel: 'やめる',
  replanTitle: 'よていを かえても いい？',
  replanBody: '{今日|きょう|2} やった {教科|きょうか|2}に {合|あ|2}わせて、これからの よていを こう かえるよ。',
  replanOk: 'いいよ',
  replanKeep: 'かえない',
  replanMore: (n: number) => `ほかに ${n}こ かわるよ`,
  missedTitle: 'できなかった {教科|きょうか|2}が あるよ',
  missedBody:
    'きのうまでに できなかった {分|ぶん|2}を、これからの よていに {入|い|1}れるね。こう かえても いい？',
  examCountdown: (name: string, grade: string, days: number) =>
    `${name} ${grade}まで あと ${markDayCount(days)}`,
  examToday: (name: string, grade: string) => `{今日|きょう|2}は ${name} ${grade}の {日|ひ|1}！ がんばってね`,
  waitingApproval: 'よていの へんこうは、おうちの {人|ひと|1}の かくにんを まってるよ',
  parentEntry: 'おうちの {人|ひと|1}へ',
  saveError: 'きろくが うまく できなかったよ。もう {一|いち|1}ど おしてね',

  // きょうの気持ち
  moodQuestion: 'どうだった？',
  moodGood: '😊 よかった',
  moodOk: '😐 ふつう',
  moodHard: '😣 むずかしかった',

  // ふりかえり
  reviewButton: 'ふりかえりを みる',
  reviewTitle: 'ふりかえり',
  rangeWeek: '{今週|こんしゅう|2}',
  rangeMonth: '{今月|こんげつ|2}',
  doneHeadline: 'よていの うち できた {数|かず|2}',
  noPlanInRange: 'まだ よていが ないよ',
  balanceTitle: '{教科|きょうか|2}ごとの やった {数|かず|2}',
  countTimes: (n: number) => `${n}{回|かい|2}`,
  plannedTimes: (n: number) => `よてい ${n}{回|かい|2}`,
  moodTitle: '{気|き|1}もち',
  noMood: 'まだ {気|き|1}もちの きろくが ないよ。「できた！」の あとに えらんでね',
  back: 'もどる',

  // よてい（カレンダー）
  calendarButton: 'よていを みる',
  calendarTitle: 'よてい',
  viewWeek: '{週|しゅう|2}',
  viewMonth: '{月|つき|1}',
  prevWeek: '‹ {前|まえ|2}の {週|しゅう|2}',
  nextWeek: 'つぎの {週|しゅう|2} ›',
  prevMonth: '‹ {前|まえ|2}の {月|つき|1}',
  nextMonth: 'つぎの {月|つき|1} ›',
  monthTitle: (y: number, m: number) => `${y}{年|ねん|1} ${m}{月|がつ|1}`,
  todayBadge: '{今日|きょう|2}',
  restDay: 'お{休|やす|1}み',
  noPlanDay: 'よていは ないよ',
  previewNote: 'この {月|つき|1}の よていは、まだ かわるかも しれないよ',
  tapDayHint: '{日|ひ|1}にちを タップすると、その {日|ひ|1}の よていが {見|み|1}られるよ',
  cellPlanned: (n: number) => `${n}こ`,
  weekdayShort: WEEKDAYS_SHORT,

  /** 例：11月 15日 日曜日（ひらがなでは 11がつ 15にち にちようび） */
  dateLong: (date: DateKey) => {
    const [m, d] = monthAndDay(date);
    return `${m}{月|がつ|1} ${markDateDay(d)} ${WEEKDAYS[weekdayOf(date)]}`;
  },
  /** 例：11月16日（月） */
  dateShort: (date: DateKey) => {
    const [m, d] = monthAndDay(date);
    return `${m}{月|がつ|1}${markDateDay(d)}（${WEEKDAYS_SHORT[weekdayOf(date)]}）`;
  },

  // 読み上げ用（名前が a11y で始まるもの）は、いつもひらがなにする
  a11yDone: (subject: string) => `${subject}、できた`,
  a11yDoneState: (subject: string) => `${subject}、できました`,
  a11yUndo: (subject: string) => `${subject}の できたを とりけす`,
  a11yDoneOf: (done: number, planned: number) => `よてい ${planned}この うち、${done}こ できた`,
  a11yBalance: (name: string, done: number, planned: number) =>
    `${name}、やった かず ${done}かい、よてい ${planned}かい`,
  a11yMood: (name: string, good: number, ok: number, hard: number) =>
    `${name}、よかった ${good}かい、ふつう ${ok}かい、むずかしかった ${hard}かい`,
  a11yDay: (date: string, planned: number, done: number, rest: boolean, past: boolean) =>
    rest
      ? `${date}、おやすみ`
      : planned === 0
        ? `${date}、よてい なし`
        : past
          ? `${date}、よてい ${planned}こ、できた ${done}こ`
          : `${date}、よてい ${planned}こ`,
  a11yItemDone: (name: string) => `${name}、できた`,
};

type Resolved<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => string
    ? (...args: A) => string
    : T[K] extends readonly string[]
      ? string[]
      : string;
};

/** 学年に合わせた子ども画面の文言 */
export type TodayText = Resolved<typeof MARKED>;

const cache = new Map<number | undefined, TodayText>();

/** 学年に合った文言（未設定ならひらがな、1〜2年生はふりがな付き、3年生以上は漢字） */
export function todayText(grade?: number): TodayText {
  const cached = cache.get(grade);
  if (cached) return cached;

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(MARKED)) {
    const fix = (s: string) =>
      key.startsWith('a11y') ? kanaOnly(resolveMarkup(s, grade)) : resolveMarkup(s, grade);
    if (typeof value === 'function') {
      out[key] = (...args: unknown[]) => fix((value as (...a: unknown[]) => string)(...args));
    } else if (Array.isArray(value)) {
      out[key] = value.map(fix);
    } else {
      out[key] = fix(value as string);
    }
  }
  const result = out as TodayText;
  cache.set(grade, result);
  return result;
}
