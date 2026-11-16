import { StyleSheet, Text, View } from 'react-native';

import { RubyText } from '@/components/ruby-text';
import { FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTodayText } from '@/hooks/use-today-text';
import type { RewardProgress } from '@/planner';

interface Props {
  progress: RewardProgress;
  /** ごほうびの中身（保護者が決めたもの。記号は取りのぞき済み） */
  label: string;
}

/**
 * スタンプカード（ごほうびを保護者が決めているときだけ出す）。
 * たまった数は ⭐、まだの分は ○ で、数字でも示す（色だけにたよらない）。
 */
export function StampCard({ progress, label }: Props) {
  const theme = useTheme();
  const t = useTodayText();
  const filled = Math.min(progress.count, progress.goal);
  const stars = '⭐'.repeat(filled) + '○'.repeat(progress.goal - filled);

  return (
    <View
      accessible
      accessibilityLabel={t.a11yStamp(progress.count, progress.goal, label)}
      style={[
        styles.card,
        progress.reached
          ? { backgroundColor: theme.successBackground, borderColor: theme.success }
          : { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}>
      <View style={styles.header}>
        <RubyText style={[styles.title, { color: theme.text }]}>{t.stampTitle}</RubyText>
        <RubyText style={[styles.title, { color: theme.text }]}>{t.stampCount(progress.count, progress.goal)}</RubyText>
      </View>
      <Text style={[styles.stars, { color: theme.textSecondary }]}>{stars}</Text>
      <RubyText style={[styles.body, { color: theme.text }]}>
        {progress.reached ? t.stampReached(label) : t.stampLeft(progress.left, label)}
      </RubyText>
      {!progress.reached && (
        <RubyText style={[styles.hint, { color: theme.textSecondary }]}>{t.stampHint}</RubyText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    fontSize: FontSize.button,
    fontWeight: '700',
  },
  stars: {
    fontSize: FontSize.heading,
    letterSpacing: 2,
    lineHeight: 34,
  },
  body: {
    fontSize: FontSize.body,
    lineHeight: 28,
  },
  hint: {
    fontSize: FontSize.body,
  },
});
