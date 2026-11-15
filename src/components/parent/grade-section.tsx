import { StyleSheet, View } from 'react-native';

import { BigButton } from '@/components/big-button';
import { Section } from '@/components/parent/section';
import { Spacing } from '@/constants/theme';
import { PARENT_TEXT } from '@/strings/parent';

interface Props {
  grade: number | undefined;
  onChange: (grade: number | undefined) => void;
}

const GRADES = [1, 2, 3, 4, 5, 6];

/** 学年（子ども画面の教科名を漢字にするかの切り替えに使う） */
export function GradeSection({ grade, onChange }: Props) {
  return (
    <Section title={PARENT_TEXT.gradeTitle} note={PARENT_TEXT.gradeNote}>
      <View style={styles.choices}>
        <BigButton
          variant={grade === undefined ? 'primary' : 'secondary'}
          label={PARENT_TEXT.gradeUnset}
          onPress={() => onChange(undefined)}
        />
        {GRADES.map((g) => (
          <BigButton
            key={g}
            variant={grade === g ? 'primary' : 'secondary'}
            label={PARENT_TEXT.gradeValue(g)}
            onPress={() => onChange(g)}
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
