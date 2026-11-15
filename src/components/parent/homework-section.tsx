import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { BigButton } from '@/components/big-button';
import { parentStyles, Section } from '@/components/parent/section';
import { FontSize, MinTouchSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { addHomework, removeHomework } from '@/planner';
import { cleanLabel } from '@/strings/subjects';
import { PARENT_TEXT } from '@/strings/parent';
import type { HomeworkCheck, HomeworkItem } from '@/types/plan';

const MAX_HOMEWORK_NAME = 16;

interface Props {
  items: readonly HomeworkItem[];
  checks: readonly HomeworkCheck[];
  onChange: (items: HomeworkItem[], checks: HomeworkCheck[]) => void;
}

/** 学校の宿題（保護者が子どもと相談して登録する。月〜金に毎日出る） */
export function HomeworkSection({ items, checks, onChange }: Props) {
  const theme = useTheme();
  const [name, setName] = useState('');
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
