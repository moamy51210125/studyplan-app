import { useState } from 'react';
import { Text } from 'react-native';

import { MonthCalendar } from '@/components/month-calendar';
import { parentStyles, Section } from '@/components/parent/section';
import { useTheme } from '@/hooks/use-theme';
import { toggleRestDay } from '@/planner';
import { PARENT_TEXT } from '@/strings/parent';
import type { DateKey, PlanSettings } from '@/types/plan';

interface Props {
  settings: PlanSettings;
  today: DateKey;
  onChange: (settings: PlanSettings) => void;
}

/** お休みの日（明日以降をカレンダーでタップして切り替える） */
export function RestDaysSection({ settings, today, onChange }: Props) {
  const theme = useTheme();
  const [ym, setYm] = useState(() => ({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) }));
  const upcoming = settings.restDays.filter((d) => d > today).length;

  return (
    <Section title={PARENT_TEXT.restTitle} note={PARENT_TEXT.restNote}>
      <MonthCalendar
        year={ym.year}
        month={ym.month}
        onChangeMonth={(year, month) => setYm({ year, month })}
        minMonth={today.slice(0, 7)}
        isMarked={(d) => settings.restDays.includes(d)}
        markLabel={PARENT_TEXT.restMark}
        isDisabled={(d) => d <= today}
        onPressDay={(d) => onChange(toggleRestDay(settings, d))}
        a11yLabel={PARENT_TEXT.restA11y}
      />
      <Text style={[parentStyles.body, { color: theme.text }]}>{PARENT_TEXT.restCount(upcoming)}</Text>
    </Section>
  );
}
