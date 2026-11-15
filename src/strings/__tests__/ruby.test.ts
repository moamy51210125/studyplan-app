import { describe, expect, test } from '@jest/globals';
import {
  baseOnly,
  hasRuby,
  kanaOnly,
  markDateDay,
  markDayCount,
  parseRuby,
  resolveMarkup,
} from '../ruby';

const SRC = '{今日|きょう|2}は お{休|やす|1}み';

describe('resolveMarkup', () => {
  test('学年が未設定ならひらがな', () => {
    expect(resolveMarkup(SRC, undefined)).toBe('きょうは おやすみ');
  });

  test('1年生：1年生の漢字だけ、ふりがな付き', () => {
    expect(resolveMarkup(SRC, 1)).toBe('きょうは お{休|やす}み');
  });

  test('2年生：1〜2年生の漢字、ふりがな付き', () => {
    expect(resolveMarkup(SRC, 2)).toBe('{今日|きょう}は お{休|やす}み');
  });

  test('3年生以上：漢字だけ', () => {
    expect(resolveMarkup(SRC, 3)).toBe('今日は お休み');
    expect(resolveMarkup(SRC, 6)).toBe('今日は お休み');
  });
});

describe('parseRuby', () => {
  test('ふりがなの部分と、そうでない部分に分ける', () => {
    expect(parseRuby('{今日|きょう}は お{休|やす}み')).toEqual([
      { text: '今日', ruby: 'きょう' },
      { text: 'は お' },
      { text: '休', ruby: 'やす' },
      { text: 'み' },
    ]);
    expect(parseRuby('ひらがな')).toEqual([{ text: 'ひらがな' }]);
  });

  test('ふりがながあるか、よみだけ、漢字だけ', () => {
    expect(hasRuby('{今日|きょう}は')).toBe(true);
    expect(hasRuby('今日は')).toBe(false);
    expect(kanaOnly('{今日|きょう}は')).toBe('きょうは');
    expect(kanaOnly(SRC)).toBe('きょうは おやすみ');
    expect(baseOnly('{今日|きょう}は')).toBe('今日は');
  });
});

describe('日の読み', () => {
  test('日付：ついたち・ふつか・はつか など', () => {
    expect(kanaOnly(markDateDay(1))).toBe('ついたち');
    expect(kanaOnly(markDateDay(2))).toBe('ふつか');
    expect(kanaOnly(markDateDay(20))).toBe('はつか');
    expect(kanaOnly(markDateDay(15))).toBe('15にち');
    expect(resolveMarkup(markDateDay(2), 3)).toBe('2日');
  });

  test('日数：1日は いちにち（1にち）、2日は ふつか', () => {
    expect(kanaOnly(markDayCount(1))).toBe('1にち');
    expect(kanaOnly(markDayCount(2))).toBe('ふつか');
    expect(kanaOnly(markDayCount(12))).toBe('12にち');
  });
});
