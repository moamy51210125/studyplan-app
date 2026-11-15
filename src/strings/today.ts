import { weekdayOf } from '@/planner/dates';
import type { DateKey } from '@/types/plan';

/**
 * 子ども画面の文言。学年に合わせて2つの表示を切り替える。
 * - KANA: 学年が未設定・1〜2年生（ひらがな中心・分かち書き）
 * - KANJI: TEXT_KANJI_FROM_GRADE 年生から。1〜2年生で習う漢字だけを使う
 *   （今・日・教・科・合・分・入・人・休・一・月・曜 など）
 * 【仮・要確認】切り替える学年と、使う漢字
 */
export const TEXT_KANJI_FROM_GRADE = 3;

const WEEKDAYS_KANA = ['にちようび', 'げつようび', 'かようび', 'すいようび', 'もくようび', 'きんようび', 'どようび'];
const WEEKDAYS_SHORT_KANA = ['にち', 'げつ', 'か', 'すい', 'もく', 'きん', 'ど'];
const WEEKDAYS_KANJI = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];

function monthAndDay(date: DateKey): [number, number] {
  const [, m, d] = date.split('-').map(Number);
  return [m, d];
}

const KANA = {
  title: 'きょうの やること',
  loading: 'じゅんびちゅう…',
  doneButton: 'できた！',
  doneBadge: 'できたね！',
  undo: 'とりけす',
  allDone: 'ぜんぶ できたね！ すごい！',
  noPlanToday: 'きょうは べんきょうの よていは ないよ。ゆっくり やすもう！',
  nextPlan: (date: string) => `つぎは ${date} だよ`,
  otherSubjectButton: 'ちがう きょうかを やった',
  extrasTitle: 'ほかに やった きょうか',
  pickerTitle: 'どの きょうかを やったかな？',
  cancel: 'やめる',
  replanTitle: 'よていを かえても いい？',
  replanBody: 'きょう やった きょうかに あわせて、これからの よていを こう かえるよ。',
  replanOk: 'いいよ',
  replanKeep: 'かえない',
  replanMore: (n: number) => `ほかに ${n}こ かわるよ`,
  missedTitle: 'できなかった きょうかが あるよ',
  missedBody: 'きのうまでに できなかった ぶんを、これからの よていに いれるね。こう かえても いい？',
  examCountdown: (name: string, grade: string, days: number) => `${name} ${grade}まで あと ${days}にち`,
  examToday: (name: string, grade: string) => `きょうは ${name} ${grade}の ひ！ がんばってね`,
  waitingApproval: 'よていの へんこうは、おうちの ひとの かくにんを まってるよ',
  parentEntry: 'おうちの ひとへ',
  saveError: 'きろくが うまく できなかったよ。もう いちど おしてね',
  // 読み上げ用はどの学年でも同じ
  a11yDone: (subject: string) => `${subject}、できた`,
  a11yDoneState: (subject: string) => `${subject}、できました`,
  a11yUndo: (subject: string) => `${subject}の できたを とりけす`,
  /** 例：11がつ 15にち にちようび */
  dateLong: (date: DateKey) => {
    const [m, d] = monthAndDay(date);
    return `${m}がつ ${d}にち ${WEEKDAYS_KANA[weekdayOf(date)]}`;
  },
  /** 例：11がつ16にち（げつ） */
  dateShort: (date: DateKey) => {
    const [m, d] = monthAndDay(date);
    return `${m}がつ${d}にち（${WEEKDAYS_SHORT_KANA[weekdayOf(date)]}）`;
  },
};

export type TodayText = typeof KANA;

const KANJI: TodayText = {
  ...KANA,
  title: '今日の やること',
  noPlanToday: '今日は べん強の よていは ないよ。ゆっくり 休もう！',
  otherSubjectButton: 'ちがう 教科を やった',
  extrasTitle: 'ほかに やった 教科',
  pickerTitle: 'どの 教科を やったかな？',
  replanBody: '今日 やった 教科に 合わせて、これからの よていを こう かえるよ。',
  missedTitle: 'できなかった 教科が あるよ',
  missedBody: 'きのうまでに できなかった 分を、これからの よていに 入れるね。こう かえても いい？',
  examCountdown: (name, grade, days) => `${name} ${grade}まで あと ${days}日`,
  examToday: (name, grade) => `今日は ${name} ${grade}の 日！ がんばってね`,
  waitingApproval: 'よていの へんこうは、おうちの 人の かくにんを まってるよ',
  parentEntry: 'おうちの 人へ',
  saveError: 'きろくが うまく できなかったよ。もう 一ど おしてね',
  /** 例：11月 15日 日曜日 */
  dateLong: (date) => {
    const [m, d] = monthAndDay(date);
    return `${m}月 ${d}日 ${WEEKDAYS_KANJI[weekdayOf(date)]}`;
  },
  /** 例：11月16日（月） */
  dateShort: (date) => {
    const [m, d] = monthAndDay(date);
    return `${m}月${d}日（${WEEKDAYS_KANJI[weekdayOf(date)].slice(0, 1)}）`;
  },
};

/** 学年に合った文言（未設定ならひらがな） */
export function todayText(grade?: number): TodayText {
  return grade !== undefined && grade >= TEXT_KANJI_FROM_GRADE ? KANJI : KANA;
}
