import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Colors } from '@/constants/theme';
import { StudyDataProvider } from '@/hooks/use-study-data';

/** 画面の見出し（保護者画面）なども、アプリの温かみのある色にそろえる */
const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.tint,
    background: Colors.light.background,
    card: Colors.light.background,
    text: Colors.light.text,
    border: Colors.light.border,
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={navigationTheme}>
      {/* 白い背景なので、時計や電池の表示は濃い色にする */}
      <StatusBar style="dark" />
      <StudyDataProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </StudyDataProvider>
    </ThemeProvider>
  );
}
