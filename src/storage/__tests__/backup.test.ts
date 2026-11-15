import { describe, expect, jest, test } from '@jest/globals';

import { createDefaultSettings } from '@/planner/defaults';
import type { AppData } from '../app-data';
import { backupFileName, createBackupText, parseBackupText } from '../backup';

// app-data.ts が読み込む端末内保存は、このテストでは使わないので空にしておく
// （jest.mock は実行時に自動でファイルの先頭へ移される）
jest.mock('@react-native-async-storage/async-storage', () => ({}));

const data: AppData = {
  version: 1,
  settings: createDefaultSettings(),
  plan: [{ date: '2027-02-01', order: 0, subjectId: 'sansu' }],
  plannedMonths: ['2027-02'],
  records: [{ date: '2027-02-01', subjectId: 'sansu', mood: 'good' }],
  parent: { pinHash: 'abcd1234', pinSalt: 'salt', requireApproval: true },
  grade: 2,
};

describe('バックアップ', () => {
  test('書き出して読み込むと、同じデータに戻る', () => {
    const r = parseBackupText(createBackupText(data, '2027-02-03'));
    expect(r).toEqual({ ok: true, data, exportedAt: '2027-02-03' });
  });

  test('ファイル名に日付が入る', () => {
    expect(backupFileName('2027-02-03')).toBe('studyplan-backup-2027-02-03.json');
  });

  test('こわれたファイル・ほかのファイル・新しすぎる形は読み込まない', () => {
    expect(parseBackupText('{こわれた')).toEqual({ ok: false, reason: 'broken' });
    expect(parseBackupText('{"hello":1}')).toEqual({ ok: false, reason: 'not-backup' });
    expect(parseBackupText('[]')).toEqual({ ok: false, reason: 'not-backup' });
    expect(
      parseBackupText(JSON.stringify({ format: 'studyplan-backup', version: 99, exportedAt: 'x', data })),
    ).toEqual({ ok: false, reason: 'newer-version' });
    expect(
      parseBackupText(JSON.stringify({ format: 'studyplan-backup', version: 1, exportedAt: 'x', data: {} })),
    ).toEqual({ ok: false, reason: 'broken' });
  });
});
