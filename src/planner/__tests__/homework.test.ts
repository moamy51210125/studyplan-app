import { describe, expect, test } from '@jest/globals';
import {
  addHomework,
  addSchoolBreak,
  homeworkForDay,
  isHomeworkDone,
  removeHomework,
  removeSchoolBreak,
  setHomeworkDone,
} from '../homework';

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

describe('学校のお休み', () => {
  const summer = { from: '2027-07-21', to: '2027-08-31' };

  test('期間中の平日は宿題が出ない。前後は出る', () => {
    expect(homeworkForDay(items, '2027-07-21', [], [summer])).toEqual([]); // 水曜
    expect(homeworkForDay(items, '2027-08-31', [], [summer])).toEqual([]); // 火曜
    expect(homeworkForDay(items, '2027-07-20', [], [summer])).toEqual(items);
    expect(homeworkForDay(items, '2027-09-01', [], [summer])).toEqual(items);
  });

  test('日付順に足し、同じ期間は二重に足さない。消せる', () => {
    const winter = { from: '2027-12-24', to: '2028-01-07' };
    let breaks = addSchoolBreak([], winter);
    breaks = addSchoolBreak(breaks, summer);
    breaks = addSchoolBreak(breaks, summer);
    expect(breaks).toEqual([summer, winter]);
    expect(removeSchoolBreak(breaks, summer)).toEqual([winter]);
  });
});
