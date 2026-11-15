/**
 * ふりがな（ルビ）のしくみ。
 *
 * 文言の中の漢字には「{漢字|よみ|習う学年}」の印を付けておく（例：{今日|きょう|2}）。
 * 子どもの学年に合わせて、次のように変える（resolveMarkup）。
 * - 学年が未設定、または その漢字をまだ習っていない → よみ（ひらがな）
 * - 1〜2年生で、習った漢字 → {漢字|よみ}（ふりがな付きで表示する印。RubyText が表示する）
 * - 3年生以上で、習った漢字 → 漢字だけ
 *
 * 習う学年は、学年別漢字配当表にもとづく（1年：一 日 月 火 水 木 金 土 年 人 休 入 見 気 など、
 * 2年：今 週 前 教 科 合 分 強 数 回 曜 算 国 語 理 社 会 など）。
 */

/** ふりがなを付けて表示する、最後の学年（これより上の学年は漢字だけ） */
export const RUBY_UNTIL_GRADE = 2;

const MARK = /\{([^{}|]+)\|([^{}|]+)\|(\d+)\}/g;
const RUBY = /\{([^{}|]+)\|([^{}|]+)\}/g;

/** 学年に合わせて「{漢字|よみ|学年}」を変える */
export function resolveMarkup(source: string, grade: number | undefined): string {
  return source.replace(MARK, (_, base: string, reading: string, need: string) => {
    if (grade === undefined || grade < Number(need)) return reading;
    return grade <= RUBY_UNTIL_GRADE ? `{${base}|${reading}}` : base;
  });
}

export interface RubySegment {
  text: string;
  /** ふりがな（無ければ undefined） */
  ruby?: string;
}

/** 「{漢字|よみ}」をふくむ文字列を、表示用に区切る */
export function parseRuby(source: string): RubySegment[] {
  const segments: RubySegment[] = [];
  let last = 0;
  for (const m of source.matchAll(RUBY)) {
    const index = m.index ?? 0;
    if (index > last) segments.push({ text: source.slice(last, index) });
    segments.push({ text: m[1], ruby: m[2] });
    last = index + m[0].length;
  }
  if (last < source.length) segments.push({ text: source.slice(last) });
  return segments;
}

export function hasRuby(source: string): boolean {
  return source.search(RUBY) !== -1;
}

/** ふりがなの印を、よみ（ひらがな）にする。読み上げや、せまい場所の表示に使う */
export function kanaOnly(source: string): string {
  return source.replace(MARK, '$2').replace(RUBY, '$2');
}

/** ふりがなの印を外して、漢字だけにする */
export function baseOnly(source: string): string {
  return source.replace(MARK, '$1').replace(RUBY, '$1');
}

/** 日付の「日」の読み（ついたち・ふつか など） */
const DATE_DAY_READING: Record<number, string> = {
  1: 'ついたち',
  2: 'ふつか',
  3: 'みっか',
  4: 'よっか',
  5: 'いつか',
  6: 'むいか',
  7: 'なのか',
  8: 'ようか',
  9: 'ここのか',
  10: 'とおか',
  14: 'じゅうよっか',
  20: 'はつか',
  24: 'にじゅうよっか',
};

/** 日付の「○日」（例：2日 → ふつか、15日 → 15にち） */
export function markDateDay(day: number): string {
  const special = DATE_DAY_READING[day];
  return special ? `{${day}日|${special}|1}` : `${day}{日|にち|1}`;
}

/** 日数の「○日」（例：あと2日 → ふつか。1日は「いちにち」なので 1にち のまま） */
export function markDayCount(n: number): string {
  const special = n === 1 ? undefined : DATE_DAY_READING[n];
  return special ? `{${n}日|${special}|1}` : `${n}{日|にち|1}`;
}
