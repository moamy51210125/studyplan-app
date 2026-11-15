/**
 * 保護者モードの暗証番号（4けた）。
 *
 * 番号そのものは保存せず、ソルトを付けたハッシュ値だけを端末内に保存する。
 * これは「保存データを見られても番号がすぐには分からない」ための工夫で、
 * 4けた（1万通り）なので強い暗号ではない。お金や個人情報を守るしくみには使わないこと。
 */

const PIN_PATTERN = /^\d{4}$/;
const ROUNDS = 2000;

export function isValidPin(pin: string): boolean {
  return PIN_PATTERN.test(pin);
}

export function createSalt(random: () => number = Math.random): string {
  let salt = '';
  for (let i = 0; i < 16; i++) salt += Math.floor(random() * 16).toString(16);
  return salt;
}

/** FNV-1a（32bit）をくり返したハッシュ */
export function hashPin(pin: string, salt: string): string {
  let h = 0x811c9dc5;
  for (let round = 0; round < ROUNDS; round++) {
    const input = `${salt}:${pin}:${round}:${h}`;
    for (let i = 0; i < input.length; i++) {
      h ^= input.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
  }
  return h.toString(16).padStart(8, '0');
}

export function verifyPin(pin: string, salt: string, pinHash: string): boolean {
  return isValidPin(pin) && hashPin(pin, salt) === pinHash;
}

/** 続けて間違えたときに待たせる（MAX_FAILURES 回で LOCK_MS 待ち） */
export const MAX_FAILURES = 5;
export const LOCK_MS = 30_000;

/**
 * 暗証番号を忘れたときの確認問題（2けた × 2けた）。
 * 【仮】小学校高学年は解けるので、強い守りではない。ユーザー確認待ち。
 */
export function createForgotQuestion(random: () => number = Math.random): { a: number; b: number } {
  const pick = () => 12 + Math.floor(random() * 88); // 12〜99
  return { a: pick(), b: pick() };
}
