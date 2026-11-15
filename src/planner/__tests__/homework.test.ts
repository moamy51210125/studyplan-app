import { describe, expect, test } from '@jest/globals';
import { addHomework, homeworkForDay, isHomeworkDone, removeHomework, setHomeworkDone } from '../homework';

const items = [
  { id: 'hw-1', label: 'けいさんドリル' },
  { id: 'hw-2', label: 'おんどく' },
];

describe('homeworkForDay', () => {
  test('月〜金に毎日出て、土日とお休みの日は出ない', () => {
    // 2027-02-01 は月曜
    expect(homeworkForDay(items, '2027-02-01', [])).toEqual(items);
    expect(homeworkForDay(items, '2027-02-05', [])).toEqual(items);
    expect(homeworkForDay(items, '2027-02-06', [])).toEqual([]);
    expect(homeworkForDay(items, '2027-02-07', [])).toEqual([]);
    expect(homeworkForDay(items, '2027-02-02', ['2027-02-02'])).toEqual([]);
  });
});

describe('宿題のチェック', () => {
  test('その日だけチェックが付き、外せる', () => {
    let checks = setHomeworkDone([], '2027-02-01', 'hw-1', true);
    checks = setHomeworkDone(checks, '2027-02-01', 'hw-1', true); // 2回押しても1つ
    expect(checks).toEqual([{ date: '2027-02-01', homeworkId: 'hw-1' }]);
    expect(isHomeworkDone(checks, '2027-02-01', 'hw-1')).toBe(true);
    expect(isHomeworkDone(checks, '2027-02-02', 'hw-1')).toBe(false);
    expect(setHomeworkDone(checks, '2027-02-01', 'hw-1', false)).toEqual([]);
  });
});

describe('addHomework / removeHomework', () => {
  test('足すと新しい番号が付き、空の名前は足さない', () => {
    const added = addHomework(items, '  かんじ ');
    expect(added[2]).toEqual({ id: 'hw-3', label: 'かんじ' });
    expect(addHomework(items, '  ')).toEqual(items);
  });

  test('消すと、その宿題のチェックも消える', () => {
    const checks = [
      { date: '2027-02-01', homeworkId: 'hw-1' },
      { date: '2027-02-01', homeworkId: 'hw-2' },
    ];
    expect(removeHomework(items, checks, 'hw-1')).toEqual({
      items: [items[1]],
      checks: [checks[1]],
    });
  });
});
