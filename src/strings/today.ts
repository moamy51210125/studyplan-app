import { weekdayOf } from '@/planner/dates';
import type { DateKey } from '@/types/plan';

/** 「きょうの やること」画面の文言（低学年でも読めるよう、ひらがな中心・分かち書き） */
export const TODAY_TEXT = {
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
  saveError: 'きろくが うまく できなかったよ。もう いちど おしてね',
  a11yDone: (subject: string) => `${subject}、できた`,
  a11yDoneState: (subject: string) => `${subject}、できました`,
  a11yUndo: (subject: string) => `${subject}の できたを とりけす`,
} as const;

const WEEKDAYS = ['にちようび', 'げつようび', 'かようび', 'すいようび', 'もくようび', 'きんようび', 'どようび'];
const WEEKDAYS_SHORT = ['にち', 'げつ', 'か', 'すい', 'もく', 'きん', 'ど'];

function monthAndDay(date: DateKey): [number, number] {
  const [, m, d] = date.split('-').map(Number);
  return [m, d];
}

/** 例：11がつ 15にち にちようび */
export function formatDateLong(date: DateKey): string {
  const [m, d] = monthAndDay(date);
  return `${m}がつ ${d}にち ${WEEKDAYS[weekdayOf(date)]}`;
}

/** 例：11がつ16にち（げつ） */
export function formatDateShort(date: DateKey): string {
  const [m, d] = monthAndDay(date);
  return `${m}がつ${d}にち（${WEEKDAYS_SHORT[weekdayOf(date)]}）`;
}
