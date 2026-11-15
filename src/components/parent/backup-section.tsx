import { getDocumentAsync } from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { isAvailableAsync, shareAsync } from 'expo-sharing';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/big-button';
import { parentStyles, Section } from '@/components/parent/section';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ensureMonthPlan } from '@/planner';
import type { AppData } from '@/storage/app-data';
import { backupFileName, createBackupText, parseBackupText } from '@/storage/backup';
import { formatDateParent, PARENT_TEXT } from '@/strings/parent';
import type { DateKey } from '@/types/plan';

interface Props {
  data: AppData;
  today: DateKey;
  commit: (next: AppData) => void;
}

function errorText(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/**
 * 選んだファイルの中身を読む。
 * Android では、ファイルの場所（URI）に空白やカッコが変換されて入っていたり、
 * content:// の形だったりするため、それにも対応した readAsStringAsync を先に使い、
 * だめなら新しい File の読み方でもう一度ためす。
 */
async function readPickedFile(uri: string): Promise<string> {
  try {
    return await readAsStringAsync(uri);
  } catch (first) {
    try {
      return await new File(uri).text();
    } catch (second) {
      throw new Error(`${errorText(first)} / ${errorText(second)}`);
    }
  }
}

/**
 * データの保存（バックアップ）。
 * - 書き出す：端末内の一時フォルダに JSON を作り、「共有」で保護者が保存先を選ぶ
 * - 読み込む：保護者が選んだファイルを確かめ、確認してから今のデータを置きかえる
 * アプリ自体は外部に通信しない（.claude/rules/child-privacy.md）。
 */
export function BackupSection({ data, today, commit }: Props) {
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const text = { color: theme.text };

  const exportBackup = async () => {
    setMessage('');
    try {
      if (!(await isAvailableAsync())) {
        setMessage(PARENT_TEXT.backupUnavailable);
        return;
      }
      const file = new File(Paths.cache, backupFileName(today));
      file.create({ overwrite: true });
      await file.write(createBackupText(data, today));
      await shareAsync(file.uri, {
        mimeType: 'application/json',
        UTI: 'public.json',
        dialogTitle: PARENT_TEXT.backupShareTitle,
      });
      commit({ ...data, lastBackupDate: today });
    } catch (e) {
      setMessage(`${PARENT_TEXT.backupExportFailed}\n${PARENT_TEXT.errorDetail(errorText(e))}`);
    }
  };

  const importBackup = async () => {
    setMessage('');
    try {
      // 保存先によっては JSON と判定されないことがあるので、すべてのファイルを選べるようにする
      const picked = await getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (picked.canceled) return;
      const content = await readPickedFile(picked.assets[0].uri);
      const result = parseBackupText(content);
      if (!result.ok) {
        setMessage(result.reason === 'newer-version' ? PARENT_TEXT.backupNewer : PARENT_TEXT.backupNotBackup);
        return;
      }
      // 取り消せない操作なので、必ず確認する
      Alert.alert(
        PARENT_TEXT.backupConfirmTitle,
        PARENT_TEXT.backupConfirmBody(formatDateParent(result.exportedAt)),
        [
          { text: PARENT_TEXT.backupConfirmCancel, style: 'cancel' },
          {
            text: PARENT_TEXT.backupConfirmOk,
            style: 'destructive',
            onPress: () => {
              const restored = result.data;
              const month = ensureMonthPlan(restored.settings, restored.plan, restored.plannedMonths, today);
              commit({ ...restored, ...month, lastOpenedDate: today });
              setMessage(PARENT_TEXT.backupRestored);
            },
          },
        ],
      );
    } catch (e) {
      // 原因が分かるように、エラーの内容も出す（保護者画面のみ）
      setMessage(`${PARENT_TEXT.backupImportFailed}\n${PARENT_TEXT.errorDetail(errorText(e))}`);
    }
  };

  return (
    <Section title={PARENT_TEXT.backupTitle} note={PARENT_TEXT.backupNote}>
      <Text style={[parentStyles.body, text]}>
        {data.lastBackupDate
          ? PARENT_TEXT.backupLast(formatDateParent(data.lastBackupDate))
          : PARENT_TEXT.backupNever}
      </Text>
      <View style={styles.buttons}>
        <BigButton label={PARENT_TEXT.backupExport} onPress={exportBackup} />
        <BigButton variant="secondary" label={PARENT_TEXT.backupImport} onPress={importBackup} />
      </View>
      {message !== '' && (
        <Text accessibilityRole="alert" style={[parentStyles.body, text]}>
          {message}
        </Text>
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
