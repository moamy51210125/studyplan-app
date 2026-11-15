import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { StudyDataProvider } from '@/hooks/use-study-data';
import { useColorSchemeSetting, useTheme } from '@/hooks/use-theme';

export default function RootLayout() {
  return (
    <StudyDataProvider>
      <ThemedStack />
    </StudyDataProvider>
  );
}

/** 画面の見出し（保護者画面）やステータスバーも、えらんだ色にそろえる */
function ThemedStack() {
  const scheme = useColorSchemeSetting();
  const theme = useTheme();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.tint,
      background: theme.background,
      card: theme.background,
      text: theme.text,
      border: theme.border,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
