import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { BigButton } from '@/components/big-button';
import { RangePicker } from '@/components/parent/range-picker';
import { parentStyles, Section } from '@/components/parent/section';
import { FontSize, MinTouchSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { addHomework, addSchoolBreak, isInRanges, removeHomework, removeSchoolBreak } from '@/planner';
import { cleanLabel } from '@/strings/subjects';
import { formatDateParent, PARENT_TEXT } from '@/strings/parent';
import type { DateKey, DateRange, HomeworkCheck, HomeworkItem } from '@/types/plan';

const MAX_HOMEWORK_NAME = 16;

interface Props {
  items: readonly HomeworkItem[];
  checks: readonly HomeworkCheck[];
  onChange: (items: HomeworkItem[], checks: HomeworkCheck[]) => void;
  /** 学校のお休み（夏休みなど） */
  breaks: readonly DateRange[];
  today: DateKey;
  onChangeBreaks: (breaks: DateRange[]) => void;
}

/** 学校の宿題（保護者が子どもと相談して登録する。月〜金に毎日出る） */
export function HomeworkSection({ items, checks, onChange, breaks, today, onChangeBreaks }: Props) {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [pickingBreak, setPickingBreak] = useState(false);
  // 終わった学校のお休みは出さない
  const shownBreaks = breaks.filter((b) => b.to >= today);
  const text = { color: theme.text };

  const add = () => {
    if (name.trim() === '') return;
    onChange(addHomework(items, name), [...checks]);
    setName('');
  };

  return (
    <Section title={PARENT_TEXT.homeworkTitle} note={PARENT_TEXT.homeworkNote}>
      {items.length === 0 ? (
        <Text style={[parentStyles.body, text]}>{PARENT_TEXT.homeworkNone}</Text>
      ) : (
        items.map((h) => {
          const label = cleanLabel(h.label);
          return (
            <View key={h.id} style={[styles.row, { borderColor: theme.border }]}>
              <Text style={[styles.rowLabel, text]}>{label}</Text>
              <BigButton
                variant="quiet"
                label={PARENT_TEXT.homeworkRemove}
                accessibilityLabel={PARENT_TEXT.homeworkRemoveA11y(label)}
                onPress={() => {
                  const next = removeHomework(items, checks, h.id);
                  onChange(next.items, next.checks);
                }}
              />
            </View>
          );
        })
      )}
      <Text style={[parentStyles.body, text]}>{PARENT_TEXT.homeworkLabel}</Text>
      <View style={styles.addRow}>
        <TextInput
          value={name}
          onChangeText={(v) => setName(v.slice(0, MAX_HOMEWORK_NAME))}
          onSubmitEditing={add}
          placeholder={PARENT_TEXT.homeworkPlaceholder}
          placeholderTextColor={theme.textSecondary}
          accessibilityLabel={PARENT_TEXT.homeworkLabel}
          style={[styles.input, text, { borderColor: theme.border, backgroundColor: theme.background }]}
        />
        <BigButton variant="secondary" label={PARENT_TEXT.homeworkAdd} onPress={add} />
      </View>

      {/* 学校のお休み（夏休みなど）：宿題だけを止める */}
      <Text accessibilityRole="header" style={[styles.subTitle, text]}>
        {PARENT_TEXT.breaksTitle}
      </Text>
      <Text style={[parentStyles.body, { color: theme.textSecondary }]}>{PARENT_TEXT.breaksNote}</Text>
      {shownBreaks.map((b) => {
        const from = formatDateParent(b.from);
        const to = formatDateParent(b.to);
        return (
          <View key={`${b.from}-${b.to}`} style={[styles.row, { borderColor: theme.border }]}>
            <Text style={[styles.rowLabel, text]}>{PARENT_TEXT.breakItem(from, to)}</Text>
            <BigButton
              variant="quiet"
              label={PARENT_TEXT.homeworkRemove}
              accessibilityLabel={PARENT_TEXT.breakRemoveA11y(from, to)}
              onPress={() => onChangeBreaks(removeSchoolBreak(breaks, b))}
            />
          </View>
        );
      })}
      {pickingBreak ? (
        <>
          <RangePicker
            today={today}
            minDate={today}
            isMarked={(d) => isInRanges(d, breaks)}
            markLabel={PARENT_TEXT.breakMark}
            a11yLabel={PARENT_TEXT.restA11y}
            onPick={(range) => {
              onChangeBreaks(addSchoolBreak(breaks, range));
              setPickingBreak(false);
            }}
          />
          <BigButton variant="secondary" label={PARENT_TEXT.cancel} onPress={() => setPickingBreak(false)} />
        </>
      ) : (
        <BigButton variant="secondary" label={PARENT_TEXT.breaksAdd} onPress={() => setPickingBreak(true)} />
      )}
    </Section>
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
  subTitle: {
    fontSize: FontSize.body,
    fontWeight: '700',
    marginTop: Spacing.two,
  },
  rowLabel: {
    fontSize: FontSize.body,
    flexShrink: 1,
  },
  addRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: MinTouchSize,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    fontSize: FontSize.body,
  },
});
