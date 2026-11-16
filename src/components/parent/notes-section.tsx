import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Section } from '@/components/parent/section';
import { FontSize, MinTouchSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { setSubjectNote } from '@/planner';
import { PARENT_TEXT } from '@/strings/parent';
import { subjectLabelForParent } from '@/strings/subjects';
import type { PlanSettings, SubjectId } from '@/types/plan';

const MAX_NOTE = 24;

interface Props {
  settings: PlanSettings;
  /** 一言は予定に関係しないので、予定は作り直さずに保存する */
  onChange: (settings: PlanSettings) => void;
}

/** 教科ごとの一言（任意）。計画に入っている教科だけ出す */
export function NotesSection({ settings, onChange }: Props) {
  const theme = useTheme();
  // 入力中は画面の中だけで持ち、入力を終えたときに保存する
  const [drafts, setDrafts] = useState<Record<SubjectId, string>>({});
  const enabled = settings.subjects.filter((s) => s.enabled);

  const save = (id: SubjectId) => {
    const draft = drafts[id];
    if (draft === undefined) return;
    onChange({ ...settings, subjects: setSubjectNote(settings.subjects, id, draft) });
    setDrafts((d) => {
      const rest = { ...d };
      delete rest[id];
      return rest;
    });
  };

  return (
    <Section title={PARENT_TEXT.notesTitle} note={PARENT_TEXT.notesNote}>
      {enabled.map((s) => {
        const name = subjectLabelForParent(s);
        return (
          <View key={s.id} style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>{name}</Text>
            <TextInput
              value={drafts[s.id] ?? s.note ?? ''}
              onChangeText={(v) => setDrafts((d) => ({ ...d, [s.id]: v.slice(0, MAX_NOTE) }))}
              onEndEditing={() => save(s.id)}
              onSubmitEditing={() => save(s.id)}
              placeholder={PARENT_TEXT.notesPlaceholder}
              placeholderTextColor={theme.textSecondary}
              accessibilityLabel={PARENT_TEXT.notesA11y(name)}
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border, backgroundColor: theme.background },
              ]}
            />
          </View>
        );
      })}
    </Section>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.one,
  },
  label: {
    fontSize: FontSize.body,
    fontWeight: '700',
  },
  input: {
    minHeight: MinTouchSize,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    fontSize: FontSize.body,
  },
});
