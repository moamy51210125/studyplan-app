import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/big-button';
import { MonthCalendar } from '@/components/month-calendar';
import { RangePicker } from '@/components/parent/range-picker';
import { parentStyles, Section } from '@/components/parent/section';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { addDays, toggleRestDay, toggleRestRange } from '@/planner';
import { formatDateParent, PARENT_TEXT } from '@/strings/parent';
import type { DateKey, PlanSettings } from '@/types/plan';

interface Props {
  settings: PlanSettings;
  today: DateKey;
  onChange: (settings: PlanSettings) => void;
}

type Mode = 'day' | 'period';

/**
 * お休みの日（明日以降）。
 * - 1日ずつ：タップで切り替える
 * - 期間でまとめて：始まりと終わりをタップ（すでに全部お休みなら、まとめて外す）
 */
export function RestDaysSection({ settings, today, onChange }: Props) {
  const theme = useTheme();
  const [mode, setMode] = useState<Mode>('day');
  const [ym, setYm] = useState(() => ({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) }));
  const [message, setMessage] = useState('');
  const upcoming = settings.restDays.filter((d) => d > today).length;
  const isRest = (d: DateKey) => settings.restDays.includes(d);

  return (
    <Section title={PARENT_TEXT.restTitle} note={PARENT_TEXT.restNote}>
      <View style={styles.modes}>
        {(['day', 'period'] as const).map((m) => (
          <View key={m} style={styles.mode}>
            <BigButton
              variant={mode === m ? 'primary' : 'secondary'}
              selected={mode === m}
              label={m === 'day' ? PARENT_TEXT.restModeDay : PARENT_TEXT.restModePeriod}
              onPress={() => {
                setMode(m);
                setMessage('');
              }}
            />
          </View>
        ))}
      </View>

      {mode === 'day' ? (
        <MonthCalendar
          year={ym.year}
          month={ym.month}
          onChangeMonth={(year, month) => setYm({ year, month })}
          minMonth={today.slice(0, 7)}
          isMarked={isRest}
          markLabel={PARENT_TEXT.restMark}
          isDisabled={(d) => d <= today}
          onPressDay={(d) => onChange(toggleRestDay(settings, d))}
          a11yLabel={PARENT_TEXT.restA11y}
        />
      ) : (
        <RangePicker
          today={today}
          minDate={addDays(today, 1)}
          isMarked={isRest}
          markLabel={PARENT_TEXT.restMark}
          a11yLabel={PARENT_TEXT.restA11y}
          onPick={(range) => {
            const result = toggleRestRange(settings, range);
            onChange(result.settings);
            const from = formatDateParent(range.from);
            const to = formatDateParent(range.to);
            setMessage(result.added ? PARENT_TEXT.restRangeAdded(from, to) : PARENT_TEXT.restRangeRemoved(from, to));
          }}
        />
      )}

      {message !== '' && (
        <Text accessibilityRole="alert" style={[parentStyles.body, { color: theme.text }]}>
          {message}
        </Text>
      )}
      <Text style={[parentStyles.body, { color: theme.text }]}>{PARENT_TEXT.restCount(upcoming)}</Text>
    </Section>
  );
}

const styles = StyleSheet.create({
  modes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  mode: {
    flexGrow: 1,
  },
});
