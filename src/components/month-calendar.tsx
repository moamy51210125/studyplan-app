import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/big-button';
import { FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { eachDay, monthRange, weekdayOf } from '@/planner/dates';
import { formatDateParent, PARENT_TEXT, WEEKDAY_NAMES } from '@/strings/parent';
import type { DateKey } from '@/types/plan';

interface MonthCalendarProps {
  year: number;
  /** 1〜12 */
  month: number;
  onChangeMonth: (year: number, month: number) => void;
  /** この月より前には戻れない（'YYYY-MM'） */
  minMonth: string;
  isMarked: (date: DateKey) => boolean;
  /** 印の文字（色だけに頼らず、文字でも示す） */
  markLabel: string;
  isDisabled: (date: DateKey) => boolean;
  onPressDay: (date: DateKey) => void;
  a11yLabel: (date: string, marked: boolean) => string;
}

/** 保護者画面用の月カレンダー（日曜はじまり） */
export function MonthCalendar({
  year,
  month,
  onChangeMonth,
  minMonth,
  isMarked,
  markLabel,
  isDisabled,
  onPressDay,
  a11yLabel,
}: MonthCalendarProps) {
  const theme = useTheme();
  const { from, to } = monthRange(year, month);
  const days = eachDay(from, to);
  const blanks = weekdayOf(from);
  const canGoPrev = from.slice(0, 7) > minMonth;

  const move = (delta: number) => {
    const index = year * 12 + (month - 1) + delta;
    onChangeMonth(Math.floor(index / 12), (index % 12) + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {canGoPrev ? (
          <BigButton variant="quiet" label={`‹ ${PARENT_TEXT.prevMonth}`} onPress={() => move(-1)} />
        ) : (
          <View style={styles.headerSpacer} />
        )}
        <Text accessibilityRole="header" style={[styles.monthTitle, { color: theme.text }]}>
          {PARENT_TEXT.calendarMonth(year, month)}
        </Text>
        <BigButton variant="quiet" label={`${PARENT_TEXT.nextMonth} ›`} onPress={() => move(1)} />
      </View>

      <View style={styles.grid}>
        {WEEKDAY_NAMES.map((name) => (
          <Text key={name} style={[styles.cell, styles.weekday, { color: theme.textSecondary }]}>
            {name.slice(0, 1)}
          </Text>
        ))}
        {Array.from({ length: blanks }, (_, i) => (
          <View key={`blank-${i}`} style={styles.cell} />
        ))}
        {days.map((date) => {
          const marked = isMarked(date);
          const disabled = isDisabled(date);
          return (
            <Pressable
              key={date}
              accessibilityRole="button"
              accessibilityLabel={a11yLabel(formatDateParent(date), marked)}
              accessibilityState={{ selected: marked, disabled }}
              disabled={disabled}
              onPress={() => onPressDay(date)}
              style={[
                styles.cell,
                styles.day,
                { borderColor: theme.border },
                marked && { backgroundColor: theme.tint, borderColor: theme.tint },
                disabled && styles.disabled,
              ]}>
              <Text style={[styles.dayNumber, { color: marked ? theme.onTint : theme.text }]}>
                {Number(date.slice(8))}
              </Text>
              {marked && <Text style={[styles.mark, { color: theme.onTint }]}>{markLabel}</Text>}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSpacer: {
    width: 56,
  },
  monthTitle: {
    fontSize: FontSize.body,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekday: {
    fontSize: 14,
    minHeight: 28,
    textAlign: 'center',
  },
  day: {
    borderWidth: 1,
    borderRadius: 8,
  },
  disabled: {
    opacity: 0.35,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  mark: {
    fontSize: 12,
    fontWeight: '700',
  },
});
