import { Colors, type ColorScheme, resolveColorScheme } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStudyData } from '@/hooks/use-study-data';

/** 使う色（白・ダーク）。保護者モードの「画面の色」の設定にしたがう */
export function useColorSchemeSetting(): ColorScheme {
  const { data } = useStudyData();
  const system = useColorScheme();
  return resolveColorScheme(data?.appearance, system);
}

/** アプリの色 */
export function useTheme() {
  return Colors[useColorSchemeSetting()];
}
