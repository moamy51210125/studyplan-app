import { StyleSheet, View } from 'react-native';

import { BigButton } from '@/components/big-button';
import { Section } from '@/components/parent/section';
import { type Appearance, Spacing } from '@/constants/theme';
import { PARENT_TEXT } from '@/strings/parent';

interface Props {
  /** 未設定なら白 */
  appearance: Appearance | undefined;
  onChange: (appearance: Appearance) => void;
}

const OPTIONS: { value: Appearance; label: string }[] = [
  { value: 'light', label: PARENT_TEXT.appearanceLight },
  { value: 'dark', label: PARENT_TEXT.appearanceDark },
  { value: 'system', label: PARENT_TEXT.appearanceSystem },
];

/** 画面の色（白・ダーク・スマホに合わせる） */
export function AppearanceSection({ appearance, onChange }: Props) {
  const current = appearance ?? 'light';
  return (
    <Section title={PARENT_TEXT.appearanceTitle} note={PARENT_TEXT.appearanceNote}>
      <View style={styles.choices}>
        {OPTIONS.map((o) => (
          <BigButton
            key={o.value}
            variant={current === o.value ? 'primary' : 'secondary'}
            selected={current === o.value}
            label={o.label}
            onPress={() => onChange(o.value)}
          />
        ))}
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
