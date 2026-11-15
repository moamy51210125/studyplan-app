import { describe, expect, test } from '@jest/globals';
import { createForgotQuestion, createSalt, hashPin, isValidPin, verifyPin } from '../pin';
import { isParentUnlocked, lockParent, unlockParent } from '../session';

describe('暗証番号', () => {
  test('4けたの数字だけを受けつける', () => {
    expect(isValidPin('0123')).toBe(true);
    expect(isValidPin('123')).toBe(false);
    expect(isValidPin('12345')).toBe(false);
    expect(isValidPin('12a4')).toBe(false);
  });

  test('正しい番号だけが通る', () => {
    const salt = createSalt();
    const hash = hashPin('2580', salt);
    expect(verifyPin('2580', salt, hash)).toBe(true);
    expect(verifyPin('2581', salt, hash)).toBe(false);
  });

  test('ハッシュに番号そのものは入らず、ソルトが違えば値も変わる', () => {
    const a = hashPin('2580', 'aaaa');
    expect(a).not.toContain('2580');
    expect(hashPin('2580', 'bbbb')).not.toBe(a);
    expect(hashPin('2580', 'aaaa')).toBe(a);
  });

  test('忘れたときの問題は2けた×2けた', () => {
    const { a, b } = createForgotQuestion();
    for (const n of [a, b]) {
      expect(n).toBeGreaterThanOrEqual(12);
      expect(n).toBeLessThanOrEqual(99);
    }
  });
});

describe('保護者モードのセッション', () => {
  test('開いてから10分で閉じる。lock ですぐ閉じる', () => {
    unlockParent(0);
    expect(isParentUnlocked(9 * 60 * 1000)).toBe(true);
    expect(isParentUnlocked(10 * 60 * 1000)).toBe(false);
    unlockParent();
    lockParent();
    expect(isParentUnlocked()).toBe(false);
  });
});
