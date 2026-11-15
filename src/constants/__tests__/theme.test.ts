import { describe, expect, test } from '@jest/globals';
import { Colors, resolveColorScheme } from '../theme';

describe('画面の色の切り替え', () => {
  test('設定が無ければ白（スマホがダークでも）', () => {
    expect(resolveColorScheme(undefined, 'dark')).toBe('light');
    expect(resolveColorScheme('light', 'dark')).toBe('light');
  });

  test('ダークを選べばいつもダーク', () => {
    expect(resolveColorScheme('dark', 'light')).toBe('dark');
  });

  test('スマホに合わせる', () => {
    expect(resolveColorScheme('system', 'dark')).toBe('dark');
    expect(resolveColorScheme('system', 'light')).toBe('light');
    expect(resolveColorScheme('system', null)).toBe('light');
  });

  test('白とダークで同じ色の名前がそろっている', () => {
    expect(Object.keys(Colors.dark).sort()).toEqual(Object.keys(Colors.light).sort());
  });
});
