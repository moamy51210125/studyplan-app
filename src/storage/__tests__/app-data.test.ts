import { describe, expect, jest, test } from '@jest/globals';

import { createDefaultSettings } from '@/planner/defaults';
import {
  activeChild,
  applyView,
  createChild,
  createEmptyFamily,
  type FamilyData,
  newChildId,
  parseStoredText,
  toFamily,
  viewOf,
} from '../app-data';

jest.mock('@react-native-async-storage/async-storage', () => ({}));

const legacy = {
  version: 1,
  settings: createDefaultSettings(),
  plan: [],
  plannedMonths: ['2027-02'],
  records: [{ date: '2027-02-01', subjectId: 'sansu' }],
  parent: { pinHash: 'h', pinSalt: 's', requireApproval: false },
  appearance: 'dark',
  grade: 3,
};

describe('parseStoredText', () => {
  test('何も保存されていなければ empty', () => {
    expect(parseStoredText(null)).toEqual({ kind: 'empty' });
  });

  test('こわれた文字や、形のちがうデータは broken（empty と区別する）', () => {
    expect(parseStoredText('{こわれた')).toEqual({ kind: 'broken' });
    expect(parseStoredText('{"version":1}')).toEqual({ kind: 'broken' });
    expect(parseStoredText('{"version":2,"children":[],"activeChildId":"x"}')).toEqual({ kind: 'broken' });
  });

  test('正しい家族のデータは ok', () => {
    const family = createEmptyFamily();
    expect(parseStoredText(JSON.stringify(family))).toEqual({ kind: 'ok', family });
  });
});

describe('toFamily：前の形（1人分）からの引きつぎ', () => {
  test('1人目の子どもになり、暗証番号と画面の色は家族共通に分かれる', () => {
    const family = toFamily(legacy) as FamilyData;
    expect(family.version).toBe(2);
    expect(family.parent).toEqual(legacy.parent);
    expect(family.appearance).toBe('dark');
    expect(family.children).toHaveLength(1);
    const child = family.children[0];
    expect(child).toMatchObject({ id: 'child-1', nickname: '', grade: 3, records: legacy.records });
    expect('parent' in child).toBe(false);
  });

  test('今の子どもが見つからなければ1人目にする', () => {
    const family = { ...createEmptyFamily(), activeChildId: 'nobody' };
    expect(toFamily(family)?.activeChildId).toBe('child-1');
  });
});

describe('viewOf / applyView', () => {
  const base = toFamily(legacy) as FamilyData;
  const family: FamilyData = {
    ...base,
    children: [...base.children, createChild('child-2', 'はな')],
    activeChildId: 'child-2',
  };

  test('画面の形は、今の子ども＋家族共通', () => {
    const view = viewOf(family);
    expect(view.records).toEqual([]);
    expect(view.parent).toEqual(legacy.parent);
    expect('nickname' in view).toBe(false);
  });

  test('画面で変えると、今の子どもと家族共通にだけ反映され、ほかの子どもは変わらない', () => {
    const view = viewOf(family);
    const next = applyView(family, {
      ...view,
      records: [{ date: '2027-02-02', subjectId: 'kokugo' }],
      appearance: 'light',
    });
    expect(next.appearance).toBe('light');
    expect(activeChild(next)).toMatchObject({ id: 'child-2', nickname: 'はな', records: [{ date: '2027-02-02', subjectId: 'kokugo' }] });
    expect(next.children[0]).toEqual(family.children[0]);
  });

  test('家族共通の項目を消すと、消える', () => {
    const next = applyView(family, { ...viewOf(family), parent: undefined });
    expect(next.parent).toBeUndefined();
  });
});

describe('createChild / newChildId', () => {
  test('ニックネームは前後の空白を取り、10文字まで', () => {
    expect(createChild('child-9', '  たろう  ').nickname).toBe('たろう');
    expect(createChild('child-9', 'あいうえおかきくけこさ').nickname).toBe('あいうえおかきくけこ');
  });

  test('使っていない id を返す', () => {
    const family = createEmptyFamily();
    expect(newChildId(family)).toBe('child-2');
  });
});
