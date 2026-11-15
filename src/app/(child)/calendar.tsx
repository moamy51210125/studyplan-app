import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '@/components/big-button';
import { FontSize, MaxContentWidth, Spacing } from '@/constants/theme';
import { useStudyData } from '@/hooks/use-study-data';
import { useTheme } from '@/hooks/use-theme';
import { useTodayText } from '@/hooks/use-today-text';
import {
  addDays,
  dayView,
  type DayView,
  eachDay,
  monthRange,
  planForRange,
  weekdayOf,
  weekRangeOf,
} from '@/planner';
import { subjectLabelForChild } from '@/strings/subjects';
import type { DateKey, SubjectId } from '@/types/plan';

type ViewMode = 'week' | 'month';

/**
 * 子ども用：よてい（週・月のカレンダー）
 * - 週：月曜〜日曜を縦に並べ、教科と ✓ をすべて見せる
 * - 月：マスには「できた数/よてい数」とお休みだけ。タップした日の教科を下に見せる
 */
export default function CalendarScreen() {
  const theme = useTheme();
  const t = useTodayText();
  const { today, data } = useStudyData();
  const [mode, setMode] = useState<ViewMode>('week');
  const [weekFrom, setWeekFrom] = useState(() => weekRangeOf(today).from);
  const [ym, setYm] = useState(() => ({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) }));
  const [selected, setSelected] = useState<DateKey>(today);

  if (!data) return null;

  const labelOf = (id: SubjectId) => {
    const s = data.settings.subjects.find((x) => x.id === id);
    return s ? subjectLabelForChild(s, data.grade) : id;
  };

  const range = mode === 'week' ? { from: weekFrom, to: addDays(weekFrom, 6) } : monthRange(ym.y, ym.m);
  const { slots, preview } = planForRange(
    data.plan,
    data.plannedMonths,
    data.settings,
    range.from,
    range.to,
    today,
  );
  const viewOf = (date: DateKey) => dayView(slots, data.records, data.settings.restDays, date, today);

  const moveMonth = (delta: number) => {
    const index = ym.y * 12 + (ym.m - 1) + delta;
    setYm({ y: Math.floor(index / 12), m: (index % 12) + 1 });
  };

  const text = { color: theme.text };
  const sub = { color: theme.textSecondary };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={[styles.title, text]}>
          {t.calendarTitle}
        </Text>

        <View style={styles.row}>
          {(['week', 'month'] as const).map((k) => (
            <View key={k} style={styles.flex}>
              <BigButton
                variant={mode === k ? 'primary' : 'secondary'}
                selected={mode === k}
                label={k === 'week' ? t.viewWeek : t.viewMonth}
                onPress={() => setMode(k)}
              />
            </View>
          ))}
        </View>

        {/* 前・次への移動と見出し */}
        <View style={styles.nav}>
          <BigButton
            variant="quiet"
            label={mode === 'week' ? t.prevWeek : t.prevMonth}
            onPress={() => (mode === 'week' ? setWeekFrom(addDays(weekFrom, -7)) : moveMonth(-1))}
          />
          <BigButton
            variant="quiet"
            label={mode === 'week' ? t.nextWeek : t.nextMonth}
            onPress={() => (mode === 'week' ? setWeekFrom(addDays(weekFrom, 7)) : moveMonth(1))}
          />
        </View>
        <Text accessibilityRole="header" style={[styles.heading, text]}>
          {mode === 'week'
            ? `${t.dateShort(range.from)} 〜 ${t.dateShort(range.to)}`
            : t.monthTitle(ym.y, ym.m)}
        </Text>
        {preview && <Text style={[styles.body, sub]}>{t.previewNote}</Text>}

        {mode === 'week' ? (
          eachDay(range.from, range.to).map((date) => (
            <DayCard key={date} day={viewOf(date)} labelOf={labelOf} />
          ))
        ) : (
          <>
            <MonthGrid
              from={range.from}
              to={range.to}
              selected={selected}
              onSelect={setSelected}
              viewOf={viewOf}
            />
            <Text style={[styles.body, sub]}>{t.tapDayHint}</Text>
            {selected >= range.from && selected <= range.to && (
              <DayCard day={viewOf(selected)} labelOf={labelOf} />
            )}
          </>
        )}

        <BigButton variant="secondary" label={t.back} onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}

/** 1日分の予定（教科名と ✓） */
function DayCard({ day, labelOf }: { day: DayView; labelOf: (id: SubjectId) => string }) {
  const theme = useTheme();
  const t = useTodayText();
  const text = { color: theme.text };

  return (
    <View
      style={[
        styles.dayCard,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: day.isToday ? theme.tint : theme.border,
          borderWidth: day.isToday ? 3 : 1,
        },
      ]}>
      <View style={styles.dayHeader}>
        <Text style={[styles.dayTitle, text]}>{t.dateShort(day.date)}</Text>
        {day.isToday && (
          <Text style={[styles.badge, { backgroundColor: theme.tint, color: theme.onTint }]}>
            {t.todayBadge}
          </Text>
        )}
      </View>

      {day.isRest ? (
        <Text style={[styles.body, text]}>💤 {t.restDay}</Text>
      ) : day.items.length === 0 && day.extras.length === 0 ? (
        <Text style={[styles.body, { color: theme.textSecondary }]}>{t.noPlanDay}</Text>
      ) : (
        <View style={styles.chips}>
          {day.items.map(({ slot, done }) => {
            const name = labelOf(slot.subjectId);
            return (
              <Text
                key={slot.order}
                accessibilityLabel={done ? t.a11yItemDone(name) : name}
                style={[
                  styles.chip,
                  done
                    ? { backgroundColor: theme.successBackground, color: theme.success, borderColor: theme.success }
                    : { color: theme.text, borderColor: theme.border },
                ]}>
                {done ? `✓ ${name}` : name}
              </Text>
            );
          })}
          {day.extras.map(({ record, index }) => {
            const name = labelOf(record.subjectId);
            return (
              <Text
                key={`extra-${index}`}
                accessibilityLabel={t.a11yItemDone(name)}
                style={[
                  styles.chip,
                  { backgroundColor: theme.successBackground, color: theme.success, borderColor: theme.success },
                ]}>
                {`✓ ${name}`}
              </Text>
            );
          })}
        </View>
      )}
    </View>
  );
}

/** 月のマス目（日曜はじまり）。マスには数とお休みだけを出す */
function MonthGrid({
  from,
  to,
  selected,
  onSelect,
  viewOf,
}: {
  from: DateKey;
  to: DateKey;
  selected: DateKey;
  onSelect: (date: DateKey) => void;
  viewOf: (date: DateKey) => DayView;
}) {
  const theme = useTheme();
  const t = useTodayText();
  const blanks = weekdayOf(from);

  return (
    <View style={styles.grid}>
      {t.weekdayShort.map((w) => (
        <Text key={w} style={[styles.cell, styles.weekday, { color: theme.textSecondary }]}>
          {w}
        </Text>
      ))}
      {Array.from({ length: blanks }, (_, i) => (
        <View key={`blank-${i}`} style={styles.cell} />
      ))}
      {eachDay(from, to).map((date) => {
        const day = viewOf(date);
        const isSelected = date === selected;
        const showDone = day.isPast || day.isToday;
        const status = day.isRest
          ? t.restDay
          : day.planned === 0
            ? ''
            : showDone
              ? `${day.done === day.planned ? '✓' : ''}${day.done}/${day.planned}`
              : t.cellPlanned(day.planned);
        const color = isSelected ? theme.onTint : theme.text;
        return (
          <Pressable
            key={date}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={t.a11yDay(t.dateShort(date), day.planned, day.done, day.isRest, showDone)}
            onPress={() => onSelect(date)}
            style={[
              styles.cell,
              styles.day,
              { borderColor: day.isToday ? theme.tint : theme.border, borderWidth: day.isToday ? 3 : 1 },
              isSelected && { backgroundColor: theme.tint },
            ]}>
            <Text style={[styles.dayNumber, { color }]}>{Number(date.slice(8))}</Text>
            <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.cellStatus, { color }]}>
              {status}
            </Text>
          </Pressable>
        );
      })}
    </View>
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
  heading: {
    fontSize: FontSize.heading,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    fontSize: FontSize.body,
    lineHeight: 28,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  flex: {
    flex: 1,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCard: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dayTitle: {
    fontSize: FontSize.body,
    fontWeight: '700',
  },
  badge: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: Spacing.two,
    borderRadius: 8,
    overflow: 'hidden',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    fontSize: FontSize.body,
    fontWeight: '600',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    overflow: 'hidden',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  weekday: {
    minHeight: 28,
    fontSize: 14,
    textAlign: 'center',
  },
  day: {
    borderRadius: 8,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  // マスの中の補足（くわしくは下の DayCard に大きな文字で出す）
  cellStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
});
