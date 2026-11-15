/**
 * 保護者モードが開いているかどうか（アプリを動かしている間だけ。保存はしない）。
 * 保護者画面は、これが開いていなければ暗証番号の画面へ戻す。
 */

const SESSION_MS = 10 * 60 * 1000;
let unlockedAt: number | null = null;

export function unlockParent(now: number = Date.now()): void {
  unlockedAt = now;
}

export function lockParent(): void {
  unlockedAt = null;
}

export function isParentUnlocked(now: number = Date.now()): boolean {
  return unlockedAt !== null && now - unlockedAt < SESSION_MS;
}
