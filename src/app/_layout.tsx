import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { StudyDataProvider } from '@/hooks/use-study-data';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StudyDataProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </StudyDataProvider>
    </ThemeProvider>
  );
}
