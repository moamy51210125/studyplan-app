import type { DateKey, Weekday } from '@/types/plan';

// 日付は 'YYYY-MM-DD' の文字列で扱い、計算は UTC で行う。
// こうするとタイムゾーンや夏時間の影響を受けない。
// 端末の「今日」を作るときだけ toDateKey でローカル日付を使う。

const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseDateKey(key: DateKey): number {
  const m = DATE_KEY_PATTERN.exec(key);
  if (!m) throw new Error(`日付の形式が正しくありません: ${key}`);
  const ms = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (formatUtc(ms) !== key) throw new Error(`存在しない日付です: ${key}`);
  return ms;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function formatUtc(ms: number): DateKey {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** 端末のローカル日付から DateKey を作る */
export function toDateKey(date: Date): DateKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function addDays(key: DateKey, days: number): DateKey {
  return formatUtc(parseDateKey(key) + days * DAY_MS);
}

export function weekdayOf(key: DateKey): Weekday {
  return new Date(parseDateKey(key)).getUTCDay() as Weekday;
}

/** b - a の日数 */
export function daysBetween(a: DateKey, b: DateKey): number {
  return Math.round((parseDateKey(b) - parseDateKey(a)) / DAY_MS);
}

/** from から to まで（両端を含む）の日付の一覧 */
export function eachDay(from: DateKey, to: DateKey): DateKey[] {
  const days: DateKey[] = [];
  for (let ms = parseDateKey(from), end = parseDateKey(to); ms <= end; ms += DAY_MS) {
    days.push(formatUtc(ms));
  }
  return days;
}

/** month は 1〜12 */
export function monthRange(year: number, month: number): { from: DateKey; to: DateKey } {
  const from = Date.UTC(year, month - 1, 1);
  const to = Date.UTC(year, month, 0);
  return { from: formatUtc(from), to: formatUtc(to) };
}

/** その日を含む月の範囲 */
export function monthRangeOf(key: DateKey): { from: DateKey; to: DateKey } {
  const d = new Date(parseDateKey(key));
  return monthRange(d.getUTCFullYear(), d.getUTCMonth() + 1);
}

/** その日を含む週の範囲（weekStartsOn: 週の始まりの曜日。既定は月曜日） */
export function weekRangeOf(
  key: DateKey,
  weekStartsOn: Weekday = 1,
): { from: DateKey; to: DateKey } {
  const offset = (weekdayOf(key) - weekStartsOn + 7) % 7;
  const from = addDays(key, -offset);
  return { from, to: addDays(from, 6) };
}
