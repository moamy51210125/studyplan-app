import { StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/big-button';
import { FontSize, MinTouchSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { MAX_SLOTS_PER_DAY, PARENT_TEXT, WEEKDAY_NAMES } from '@/strings/parent';
import type { SlotsPerWeekday, Weekday } from '@/types/plan';

/** 月曜から並べる */
const WEEKDAY_ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

interface Props {
  value: SlotsPerWeekday;
  onChange: (next: SlotsPerWeekday) => void;
}

/** 曜日ごとの1日の回数（0〜MAX_SLOTS_PER_DAY）を「−」「＋」で決める */
export function SlotsEditor({ value, onChange }: Props) {
  const theme = useTheme();
  const text = { color: theme.text };
  const total = WEEKDAY_ORDER.reduce<number>((sum, d) => sum + (value[d] ?? 0), 0);

  const set = (day: Weekday, n: number) => {
    const clamped = Math.min(MAX_SLOTS_PER_DAY, Math.max(0, n));
    if (clamped !== value[day]) onChange({ ...value, [day]: clamped });
  };

  return (
    <View>
      {WEEKDAY_ORDER.map((day) => {
        const name = WEEKDAY_NAMES[day];
        const n = value[day] ?? 0;
        return (
          <View key={day} style={[styles.row, { borderColor: theme.border }]}>
            <Text style={[styles.label, text]}>{name}</Text>
            <View style={styles.stepper}>
              <BigButton
                variant="secondary"
                label="−"
                accessibilityLabel={PARENT_TEXT.decrease(name)}
                onPress={() => set(day, n - 1)}
              />
              <Text style={[styles.value, text]}>{PARENT_TEXT.slotsValue(n)}</Text>
              <BigButton
                variant="secondary"
                label="＋"
                accessibilityLabel={PARENT_TEXT.increase(name)}
                onPress={() => set(day, n + 1)}
              />
            </View>
          </View>
        );
      })}
      <Text style={[styles.total, text]}>{PARENT_TEXT.weeklyTotal(total)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: MinTouchSize,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    borderBottomWidth: 1,
    paddingVertical: Spacing.one,
  },
  label: {
    fontSize: FontSize.body,
    flexShrink: 1,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  value: {
    fontSize: FontSize.body,
    minWidth: 48,
    textAlign: 'center',
  },
  total: {
    fontSize: FontSize.body,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: Spacing.two,
  },
});
