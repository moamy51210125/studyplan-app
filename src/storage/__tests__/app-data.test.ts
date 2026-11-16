import { describe, expect, jest, test } from '@jest/globals';

import { createDefaultSettings } from '@/planner/defaults';
import { parseStoredText } from '../app-data';

jest.mock('@react-native-async-storage/async-storage', () => ({}));

describe('parseStoredText', () => {
  test('何も保存されていなければ empty', () => {
    expect(parseStoredText(null)).toEqual({ kind: 'empty' });
  });

  test('こわれた文字や、形のちがうデータは broken（empty と区別する）', () => {
    expect(parseStoredText('{こわれた')).toEqual({ kind: 'broken' });
    expect(parseStoredText('{"version":1}')).toEqual({ kind: 'broken' });
  });

  test('正しいデータは ok', () => {
    const data = { version: 1, settings: createDefaultSettings(), plan: [], plannedMonths: [], records: [] };
    expect(parseStoredText(JSON.stringify(data))).toEqual({ kind: 'ok', data });
  });
});
