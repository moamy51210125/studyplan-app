import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '@/components/big-button';
import { RubyText } from '@/components/ruby-text';
import { FontSize, MaxContentWidth, Spacing } from '@/constants/theme';
import { useStudyData } from '@/hooks/use-study-data';
import { useTheme } from '@/hooks/use-theme';
import { useTodayText } from '@/hooks/use-today-text';
import { monthRangeOf, progressOf, summarize, weekRangeOf } from '@/planner';
import { subjectLabelForChild } from '@/strings/subjects';
import type { SubjectId } from '@/types/plan';

type Range = 'week' | 'month';

/**
 * 子ども用：ふりかえり（今週・今月）
 * - 予定のうちできた数は、大きな数字1つで見せる（グラフにしない）
 * - 教科ごとは「よていに対する進みぐあい」の横棒＋「やった数 / よていの数」
 *   （棒の満タン＝よていの回数。よていどおりなら ✓ と「できた」の色（オレンジ）、途中は青。色だけにたよらない。凡例は使わない）
 * - 気持ちは、数の表で見せる
 * - できなかった数は強調しない（.claude/rules/kid-friendly-ui.md）
 */
export default function ReviewScreen() {
  const theme = useTheme();
  const t = useTodayText();
  const { today, data } = useStudyData();
  const [range, setRange] = useState<Range>('week');

  if (!data) return null;

  const r = range === 'week' ? weekRangeOf(today) : monthRangeOf(today);
  const to = today < r.to ? today : r.to; // 今日まで
  const order = data.settings.subjects.map((s) => s.id);
  const summary = summarize(data.plan, data.records, r.from, to, order);

  const labelOf = (id: SubjectId) => {
    const s = data.settings.subjects.find((x) => x.id === id);
    return s ? subjectLabelForChild(s, data.grade) : id;
  };
  const withMood = summary.subjects.filter((s) => s.moods.good + s.moods.ok + s.moods.hard > 0);
  const text = { color: theme.text };
  const sub = { color: theme.textSecondary };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <RubyText accessibilityRole="header" style={[styles.title, text]}>
          {t.reviewTitle}
        </RubyText>

        <View style={styles.tabs}>
          {(['week', 'month'] as const).map((k) => (
            <View key={k} style={styles.tab}>
              <BigButton
                variant={range === k ? 'primary' : 'secondary'}
                selected={range === k}
                label={k === 'week' ? t.rangeWeek : t.rangeMonth}
                onPress={() => setRange(k)}
              />
            </View>
          ))}
        </View>

        {/* 予定のうち、できた数（大きな数字） */}
        <View style={[styles.card, { backgroundColor: theme.successBackground }]}>
          <RubyText style={[styles.cardTitle, text]}>{t.doneHeadline}</RubyText>
          {summary.planned === 0 ? (
            <RubyText style={[styles.body, text]}>{t.noPlanInRange}</RubyText>
          ) : (
            <View accessible accessibilityLabel={t.a11yDoneOf(summary.doneOfPlanned, summary.planned)}>
              <Text style={[styles.hero, { color: theme.success }]}>
                {summary.doneOfPlanned}
                <Text style={[styles.heroSub, sub]}> / {summary.planned}</Text>
              </Text>
              <View style={[styles.track, { backgroundColor: theme.background }]}>
                <View
                  style={[
                    styles.fill,
                    {
                      backgroundColor: theme.success,
                      width: `${(summary.doneOfPlanned / summary.planned) * 100}%`,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </View>

        {/* 教科ごとの、よていに対する進みぐあい（棒の満タン＝よていの回数） */}
        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <RubyText accessibilityRole="header" style={[styles.cardTitle, text]}>
            {t.balanceTitle}
          </RubyText>
          <RubyText style={[styles.body, sub]}>{t.balanceHint}</RubyText>
          {summary.subjects.map((s) => {
            const p = progressOf(s);
            const fillColor = p.complete || p.unplanned ? theme.success : theme.tint;
            const value = p.unplanned ? t.countTimes(s.studied) : t.balanceValue(s.studied, s.planned);
            return (
              <View
                key={s.subjectId}
                accessible
                accessibilityLabel={t.a11yBalance(labelOf(s.subjectId), s.studied, s.planned)}
                style={styles.barRow}>
                <View style={styles.barHeader}>
                  <RubyText style={[styles.body, text, styles.bold]}>{labelOf(s.subjectId)}</RubyText>
                  <RubyText style={[styles.body, text, styles.bold]}>
                    {p.complete ? `✓ ${value}` : value}
                  </RubyText>
                </View>
                <View style={[styles.track, { backgroundColor: theme.background }]}>
                  {p.ratio > 0 && (
                    <View style={[styles.fill, { backgroundColor: fillColor, width: `${p.ratio * 100}%` }]} />
                  )}
                </View>
                {p.over > 0 && (
                  <RubyText style={[styles.body, { color: theme.success }]}>{t.balanceOver(p.over)}</RubyText>
                )}
                {p.unplanned && (
                  <RubyText style={[styles.body, { color: theme.success }]}>{t.balanceUnplanned}</RubyText>
                )}
              </View>
            );
          })}
        </View>

        {/* 気持ち（数の表） */}
        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <RubyText accessibilityRole="header" style={[styles.cardTitle, text]}>
            {t.moodTitle}
          </RubyText>
          {withMood.length === 0 ? (
            <RubyText style={[styles.body, text]}>{t.noMood}</RubyText>
          ) : (
            withMood.map((s) => (
              <View
                key={s.subjectId}
                accessible
                accessibilityLabel={t.a11yMood(labelOf(s.subjectId), s.moods.good, s.moods.ok, s.moods.hard)}
                style={[styles.moodRow, { borderColor: theme.border }]}>
                <RubyText style={[styles.body, text, styles.moodName]}>{labelOf(s.subjectId)}</RubyText>
                <Text style={[styles.body, text]}>
                  😊 {s.moods.good}　😐 {s.moods.ok}　😣 {s.moods.hard}
                </Text>
              </View>
            ))
          )}
        </View>

        <BigButton variant="secondary" label={t.back} onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: '800',
  },
  tabs: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  tab: {
    flex: 1,
  },
  card: {
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  cardTitle: {
    fontSize: FontSize.button,
    fontWeight: '700',
  },
  body: {
    fontSize: FontSize.body,
    lineHeight: 28,
  },
  hero: {
    fontSize: 48,
    fontWeight: '800',
  },
  heroSub: {
    fontSize: FontSize.heading,
    fontWeight: '600',
  },
  barRow: {
    gap: Spacing.one,
  },
  bold: {
    fontWeight: '700',
  },
  barHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  // 細めの棒。先は 4px の角丸
  track: {
    height: 14,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.two,
    borderBottomWidth: 1,
    paddingBottom: Spacing.two,
  },
  moodName: {
    fontWeight: '700',
  },
});
