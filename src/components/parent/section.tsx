import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** 保護者画面の見出しつきのまとまり */
export function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={[styles.section, { backgroundColor: theme.backgroundElement }]}>
      <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
        {title}
      </Text>
      {note && <Text style={[styles.note, { color: theme.textSecondary }]}>{note}</Text>}
      {children}
    </View>
  );
}

export const parentStyles = StyleSheet.create({
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
});

const styles = StyleSheet.create({
  section: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  title: {
    fontSize: FontSize.heading - 4,
    fontWeight: '700',
  },
  note: {
    fontSize: 16,
    lineHeight: 24,
  },
});
