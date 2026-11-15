import { describe, expect, test } from '@jest/globals';
import { subjectLabelForChild } from '../subjects';
import { todayText } from '../today';

describe('学年による子ども画面の文言', () => {
  test('未設定・1〜2年生はひらがな', () => {
    expect(todayText().title).toBe('きょうの やること');
    expect(todayText(2).dateLong('2026-11-15')).toBe('11がつ 15にち にちようび');
  });

  test('3年生からは1〜2年生の漢字を使う', () => {
    const t = todayText(3);
    expect(t.title).toBe('今日の やること');
    expect(t.otherSubjectButton).toBe('ちがう 教科を やった');
    expect(t.dateLong('2026-11-15')).toBe('11月 15日 日曜日');
    expect(t.dateShort('2026-11-16')).toBe('11月16日（月）');
    expect(t.examCountdown('漢検', '5きゅう', 12)).toBe('漢検 5きゅうまで あと 12日');
  });

  test('読み上げ用の文言は学年で変えない', () => {
    expect(todayText(6).a11yDone('算数')).toBe(todayText().a11yDone('算数'));
  });

  test('漢検・英検は3年生から漢字', () => {
    const kanken = { id: 'kanken', kind: 'exam' as const, enabled: true };
    expect(subjectLabelForChild(kanken, 2)).toBe('かんけん');
    expect(subjectLabelForChild(kanken, 3)).toBe('漢検');
  });
});
