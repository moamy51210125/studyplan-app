import { describe, expect, test } from '@jest/globals';
import { subjectLabelForChild } from '../subjects';
import { todayText } from '../today';

describe('学年による子ども画面の文言', () => {
  test('未設定はひらがな（日付の読みも正しく）', () => {
    const t = todayText();
    expect(t.title).toBe('きょうの やること');
    expect(t.dateLong('2026-11-15')).toBe('11がつ 15にち にちようび');
    expect(t.dateShort('2026-12-01')).toBe('12がつついたち（か）');
    expect(t.examCountdown('かんけん', '5きゅう', 2)).toBe('かんけん 5きゅうまで あと ふつか');
  });

  test('1年生：1年生で習う漢字だけ、ふりがな付き', () => {
    const t = todayText(1);
    expect(t.title).toBe('きょうの やること'); // 今は2年生
    expect(t.restDay).toBe('お{休|やす}み');
    expect(t.dateLong('2026-11-15')).toBe('11{月|がつ} 15{日|にち} {日|にち}よう{日|び}');
  });

  test('2年生：1〜2年生で習う漢字、ふりがな付き', () => {
    const t = todayText(2);
    expect(t.title).toBe('{今日|きょう}の やること');
    expect(t.otherSubjectButton).toBe('ちがう {教科|きょうか}を やった');
    expect(t.dateLong('2026-11-15')).toBe('11{月|がつ} 15{日|にち} {日|にち}{曜|よう}{日|び}');
  });

  test('3年生から：漢字だけ（ふりがななし）', () => {
    const t = todayText(3);
    expect(t.title).toBe('今日の やること');
    expect(t.otherSubjectButton).toBe('ちがう 教科を やった');
    expect(t.dateLong('2026-11-15')).toBe('11月 15日 日曜日');
    expect(t.dateShort('2026-11-16')).toBe('11月16日（月）');
    expect(t.examCountdown('漢検', '5きゅう', 12)).toBe('漢検 5きゅうまで あと 12日');
  });

  test('読み上げ用の文言は、いつもひらがな', () => {
    expect(todayText(2).a11yDone('{算数|さんすう}')).toBe('さんすう、できた');
    expect(todayText(6).a11yDone('さんすう')).toBe(todayText().a11yDone('さんすう'));
  });
});

describe('学年による教科名', () => {
  const sansu = { id: 'sansu', kind: 'core' as const, enabled: true };
  const eigo = { id: 'eigo', kind: 'core' as const, enabled: true };
  const kanken = { id: 'kanken', kind: 'exam' as const, enabled: true };

  test('算数：1年生はひらがな、2年生はふりがな付き、3年生から漢字', () => {
    expect(subjectLabelForChild(sansu)).toBe('さんすう');
    expect(subjectLabelForChild(sansu, 1)).toBe('さんすう');
    expect(subjectLabelForChild(sansu, 2)).toBe('{算数|さんすう}');
    expect(subjectLabelForChild(sansu, 3)).toBe('算数');
  });

  test('英語は5年生から、漢検・英検は3年生から漢字', () => {
    expect(subjectLabelForChild(eigo, 4)).toBe('えいご');
    expect(subjectLabelForChild(eigo, 5)).toBe('英語');
    expect(subjectLabelForChild(kanken, 2)).toBe('かんけん');
    expect(subjectLabelForChild(kanken, 3)).toBe('漢検');
  });

  test('自分で追加した教科は、ふりがなの記号を取りのぞく', () => {
    const custom = { id: 'custom-1', kind: 'custom' as const, enabled: true, label: 'ど{く}しょ' };
    expect(subjectLabelForChild(custom, 2)).toBe('どくしょ');
  });
});
