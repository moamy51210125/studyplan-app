import type { DateKey } from '@/types/plan';

import { type AppData, isAppData } from './app-data';

/**
 * バックアップファイルの中身（JSON）。
 * アプリは外部に何も送らない。ファイルの保存先は、保護者が「共有」の画面で選ぶ。
 */
export const BACKUP_FORMAT = 'studyplan-backup';
export const BACKUP_VERSION = 1;

interface BackupFile {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exportedAt: DateKey;
  data: AppData;
}

export function createBackupText(data: AppData, exportedAt: DateKey): string {
  const file: BackupFile = { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt, data };
  return JSON.stringify(file);
}

export function backupFileName(date: DateKey): string {
  return `studyplan-backup-${date}.json`;
}

export type ParseBackupResult =
  | { ok: true; data: AppData; exportedAt: DateKey }
  | { ok: false; reason: 'broken' | 'not-backup' | 'newer-version' };

/** 読み込んだ文字列が、このアプリのバックアップかを確かめる */
export function parseBackupText(text: string): ParseBackupResult {
  let raw: unknown;
  try {
    // 保存先のアプリによっては、先頭に BOM（見えない印）や空白が付くことがあるので取りのぞく
    raw = JSON.parse(text.replace(/^﻿/, '').trim());
  } catch {
    return { ok: false, reason: 'broken' };
  }
  if (typeof raw !== 'object' || raw === null) return { ok: false, reason: 'not-backup' };
  const file = raw as Record<string, unknown>;
  if (file.format !== BACKUP_FORMAT) return { ok: false, reason: 'not-backup' };
  if (typeof file.version !== 'number' || file.version > BACKUP_VERSION) {
    return { ok: false, reason: 'newer-version' };
  }
  if (typeof file.exportedAt !== 'string' || !isAppData(file.data)) {
    return { ok: false, reason: 'broken' };
  }
  return { ok: true, data: file.data, exportedAt: file.exportedAt };
}
