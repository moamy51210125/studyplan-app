import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { BigButton } from '@/components/big-button';
import { MonthCalendar } from '@/components/month-calendar';
import { parentStyles, Section } from '@/components/parent/section';
import { FontSize, MinTouchSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { addExam, daysBetween, removeExam } from '@/planner';
import { formatDateParent, PARENT_TEXT } from '@/strings/parent';
import { subjectLabelForParent } from '@/strings/subjects';
import type { DateKey, PlanSettings, SubjectId } from '@/types/plan';

interface Props {
  settings: PlanSettings;
  today: DateKey;
  onChange: (settings: PlanSettings) => void;
}

const MAX_GRADE_LENGTH = 8;

/** 試験日（漢検・英検など、検定対策の教科の試験を登録する） */
export function ExamsSection({ settings, today, onChange }: Props) {
  const theme = useTheme();
  const examSubjects = settings.subjects.filter((s) => s.kind === 'exam');
  const [subjectId, setSubjectId] = useState<SubjectId | null>(null);
  const [grade, setGrade] = useState('');
  const [date, setDate] = useState<DateKey | null>(null);
  const [message, setMessage] = useState('');
  const [ym, setYm] = useState(() => ({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) }));

  const labelOf = (id: SubjectId) => {
    const s = settings.subjects.find((x) => x.id === id);
    return s ? subjectLabelForParent(s) : id;
  };

  const register = () => {
    if (!subjectId || grade.trim() === '' || !date) {
      setMessage(PARENT_TEXT.examNeedAll);
      return;
    }
    onChange(addExam(settings, { subjectId, grade, date }));
    setSubjectId(null);
    setGrade('');
    setDate(null);
    setMessage('');
  };

  const text = { color: theme.text };

  return (
    <Section title={PARENT_TEXT.examsTitle} note={PARENT_TEXT.examsNote}>
      {settings.exams.length === 0 ? (
        <Text style={[parentStyles.body, text]}>{PARENT_TEXT.examNone}</Text>
      ) : (
        settings.exams.map((e) => (
          <View key={`${e.subjectId}-${e.date}-${e.grade}`} style={[styles.row, { borderColor: theme.border }]}>
            <Text style={[parentStyles.body, text, styles.rowText]}>
              {PARENT_TEXT.examItem(labelOf(e.subjectId), e.grade, formatDateParent(e.date))}
              {'　'}
              {PARENT_TEXT.examDaysLeft(daysBetween(today, e.date))}
            </Text>
            <BigButton
              variant="quiet"
              label={PARENT_TEXT.examRemove}
              accessibilityLabel={PARENT_TEXT.examRemoveA11y(labelOf(e.subjectId))}
              onPress={() => onChange(removeExam(settings, e))}
            />
          </View>
        ))
      )}

      <Text style={[parentStyles.body, text]}>{PARENT_TEXT.examSubject}</Text>
      <View style={styles.choices}>
        {examSubjects.map((s) => (
          <BigButton
            key={s.id}
            variant={subjectId === s.id ? 'primary' : 'secondary'}
            label={subjectLabelForParent(s)}
            onPress={() => setSubjectId(s.id)}
          />
        ))}
      </View>

      <Text style={[parentStyles.body, text]}>{PARENT_TEXT.examGrade}</Text>
      <TextInput
        value={grade}
        onChangeText={(t) => setGrade(t.slice(0, MAX_GRADE_LENGTH))}
        placeholder={PARENT_TEXT.examGradePlaceholder}
        placeholderTextColor={theme.textSecondary}
        accessibilityLabel={PARENT_TEXT.examGrade}
        style={[styles.input, text, { borderColor: theme.border, backgroundColor: theme.background }]}
      />

      <Text style={[parentStyles.body, text]}>
        {date ? PARENT_TEXT.examDateChosen(formatDateParent(date)) : PARENT_TEXT.examDate}
      </Text>
      <MonthCalendar
        year={ym.year}
        month={ym.month}
        onChangeMonth={(year, month) => setYm({ year, month })}
        minMonth={today.slice(0, 7)}
        isMarked={(d) => d === date}
        markLabel={PARENT_TEXT.examMark}
        isDisabled={(d) => d <= today}
        onPressDay={setDate}
        a11yLabel={(d) => d}
      />

      {message !== '' && (
        <Text accessibilityRole="alert" style={[parentStyles.body, text]}>
          {message}
        </Text>
      )}
      <BigButton label={PARENT_TEXT.examAdd} onPress={register} />
    </Section>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    gap: Spacing.two,
  },
  rowText: {
    flexShrink: 1,
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  input: {
    minHeight: MinTouchSize,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    fontSize: FontSize.body,
  },
});
