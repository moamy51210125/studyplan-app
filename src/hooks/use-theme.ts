import { Colors } from '@/constants/theme';

/** アプリの色。スマホがダークモードでも、いつも白い背景の色を使う */
export function useTheme() {
  return Colors.light;
}
