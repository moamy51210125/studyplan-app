import { describe, expect, test } from '@jest/globals';
import {
  clampGoal,
  giveReward,
  isDayComplete,
  rewardProgress,
  startReward,
  syncTodayStamp,
} from '../stamps';

describe('syncTodayStamp', () => {
  test('ぜんぶできたら1日1つ。とりけしたら外れる', () => {
    let stamps = syncTodayStamp(['2027-02-01'], '2027-02-02', true);
    stamps = syncTodayStamp(stamps, '2027-02-02', true);
    expect(stamps).toEqual(['2027-02-01', '2027-02-02']);
    expect(syncTodayStamp(stamps, '2027-02-02', false)).toEqual(['2027-02-01']);
  });
});

describe('ごほうび', () => {
  test('始めたときのスタンプは数えず、0から数える', () => {
    const reward = startReward(4, 10, ' すきな おやつ ');
    expect(reward).toEqual({ goal: 10, label: 'すきな おやつ', base: 4 });
    expect(rewardProgress(7, reward)).toEqual({ count: 3, goal: 10, left: 7, reached: false });
  });

  test('たまったら reached。渡すと、多い分は次に持ちこす', () => {
    const reward = startReward(0, 3, 'こうえん');
    expect(rewardProgress(4, reward).reached).toBe(true);
    const next = giveReward(reward);
    expect(rewardProgress(4, next)).toEqual({ count: 1, goal: 3, left: 2, reached: false });
  });

  test('ゴールの数は 3〜30', () => {
    expect(clampGoal(1)).toBe(3);
    expect(clampGoal(50)).toBe(30);
    expect(clampGoal(12)).toBe(12);
  });
});

describe('isDayComplete', () => {
  const plan = [{ date: '2027-02-01', order: 0, subjectId: 'sansu' }];
  const hw = [{ id: 'hw-1', label: 'ドリル' }];
  const done = [{ date: '2027-02-01', subjectId: 'sansu' }];
  const checked = [{ date: '2027-02-01', homeworkId: 'hw-1' }];

  test('予定と宿題がぜんぶできたら true', () => {
    expect(isDayComplete(plan, done, hw, checked, '2027-02-01')).toBe(true);
    expect(isDayComplete(plan, done, hw, [], '2027-02-01')).toBe(false);
    expect(isDayComplete(plan, [], hw, checked, '2027-02-01')).toBe(false);
  });

  test('宿題だけの日もできる。何も無い日は false', () => {
    expect(isDayComplete([], [], hw, checked, '2027-02-01')).toBe(true);
    expect(isDayComplete([], [], [], [], '2027-02-01')).toBe(false);
  });
});
