import { StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/big-button';
import { Section } from '@/components/parent/section';
import { FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { setSubjectAmount } from '@/planner';
import { PARENT_TEXT } from '@/strings/parent';
import { subjectLabelForParent } from '@/strings/subjects';
import type { PlanSettings, SubjectAmount } from '@/types/plan';

interface Props {
  settings: PlanSettings;
  onChange: (settings: PlanSettings) => void;
}

const OPTIONS: { value: SubjectAmount; label: string }[] = [
  { value: 'less', label: PARENT_TEXT.amountLess },
  { value: 'normal', label: PARENT_TEXT.amountNormal },
  { value: 'more', label: PARENT_TEXT.amountMore },
];

/** 教科ごとの量（少なめ・ふつう・多め）。計画に入っている教科だけ出す */
export function AmountSection({ settings, onChange }: Props) {
  const theme = useTheme();
  const enabled = settings.subjects.filter((s) => s.enabled);

  return (
    <Section title={PARENT_TEXT.amountTitle} note={PARENT_TEXT.amountNote}>
      {enabled.map((s) => {
        const name = subjectLabelForParent(s);
        const current = s.amount ?? 'normal';
        return (
          <View key={s.id} style={[styles.row, { borderColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.text }]}>{name}</Text>
            <View style={styles.choices}>
              {OPTIONS.map((o) => (
                <BigButton
                  key={o.value}
                  variant={current === o.value ? 'primary' : 'secondary'}
                  selected={current === o.value}
                  label={o.label}
                  accessibilityLabel={PARENT_TEXT.amountA11y(name, o.label)}
                  onPress={() =>
                    current !== o.value &&
                    onChange({ ...settings, subjects: setSubjectAmount(settings.subjects, s.id, o.value) })
                  }
                />
              ))}
            </View>
          </View>
        );
      })}
    </Section>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.two,
    borderBottomWidth: 1,
    paddingVertical: Spacing.two,
  },
  label: {
    fontSize: FontSize.body,
    fontWeight: '700',
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
