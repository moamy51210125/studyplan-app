import { useState } from 'react';
import { Text } from 'react-native';

import { BigButton } from '@/components/big-button';
import { MonthCalendar } from '@/components/month-calendar';
import { parentStyles } from '@/components/parent/section';
import { useTheme } from '@/hooks/use-theme';
import { orderedRange } from '@/planner';
import { formatDateParent, PARENT_TEXT } from '@/strings/parent';
import type { DateKey, DateRange } from '@/types/plan';

interface Props {
  today: DateKey;
  /** この日より前はえらべない */
  minDate: DateKey;
  /** すでに入っている日の印（お休みなど） */
  isMarked: (date: DateKey) => boolean;
  markLabel: string;
  /** 始まりと終わりをえらび終えたとき */
  onPick: (range: DateRange) => void;
  a11yLabel: (date: string, marked: boolean) => string;
}

/** カレンダーで「始まりの日」「終わりの日」の順にタップして期間をえらぶ（保護者画面用） */
export function RangePicker({ today, minDate, isMarked, markLabel, onPick, a11yLabel }: Props) {
  const theme = useTheme();
  const [ym, setYm] = useState(() => ({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) }));
  const [start, setStart] = useState<DateKey | null>(null);

  const press = (date: DateKey) => {
    if (start === null) {
      setStart(date);
      return;
    }
    onPick(orderedRange(start, date));
    setStart(null);
  };

  return (
    <>
      <Text style={[parentStyles.body, { color: theme.text }]}>
        {start === null ? PARENT_TEXT.rangeStartHint : PARENT_TEXT.rangeEndHint(formatDateParent(start))}
      </Text>
      <MonthCalendar
        year={ym.year}
        month={ym.month}
        onChangeMonth={(year, month) => setYm({ year, month })}
        minMonth={minDate.slice(0, 7)}
        isMarked={(d) => d === start || isMarked(d)}
        markLabel={markLabel}
        markLabelOf={(d) => (d === start ? PARENT_TEXT.rangeStartMark : undefined)}
        isDisabled={(d) => d < minDate}
        onPressDay={press}
        a11yLabel={a11yLabel}
      />
      {start !== null && (
        <BigButton variant="secondary" label={PARENT_TEXT.rangeCancel} onPress={() => setStart(null)} />
      )}
    </>
  );
}
