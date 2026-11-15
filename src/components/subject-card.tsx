import { StyleSheet, View } from 'react-native';

import { BigButton } from '@/components/big-button';
import { RubyText } from '@/components/ruby-text';
import { FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTodayText } from '@/hooks/use-today-text';
import { kanaOnly } from '@/strings/ruby';
import type { Mood } from '@/types/plan';

interface SubjectCardProps {
  /** 教科名（ふりがなの印をふくんでもよい） */
  label: string;
  done: boolean;
  /** 未完了のときに「できた！」を押したとき（無ければボタンを出さない） */
  onDone?: () => void;
  onUndo: () => void;
  /** できたあとの気持ち（未選択なら undefined） */
  mood?: Mood;
  onMood?: (mood: Mood) => void;
  /** 'homework' は学校の宿題（ボタンは「やった！」、読み上げも宿題用） */
  kind?: 'subject' | 'homework';
}

const MOODS: Mood[] = ['good', 'ok', 'hard'];

/** 教科1つ分のカード。できたかどうかは色だけでなく文字と ✓ でも示す */
export function SubjectCard({ label, done, onDone, onUndo, mood, onMood, kind = 'subject' }: SubjectCardProps) {
  const theme = useTheme();
  const t = useTodayText();
  const moodLabel = { good: t.moodGood, ok: t.moodOk, hard: t.moodHard };
  const spoken = kanaOnly(label);
  const homework = kind === 'homework';
  const doneLabel = homework ? t.homeworkCheck : t.doneButton;
  const a11yDone = homework ? t.a11yHomeworkDone : t.a11yDone;
  const a11yState = homework ? t.a11yHomeworkState : t.a11yDoneState;
  const a11yUndo = homework ? t.a11yHomeworkUndo : t.a11yUndo;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: done ? theme.successBackground : theme.backgroundElement,
          borderColor: done ? theme.success : theme.border,
        },
      ]}>
      <View style={styles.topRow}>
        <RubyText
          style={[styles.label, { color: theme.text }]}
          accessibilityLabel={done ? a11yState(spoken) : spoken}>
          {label}
        </RubyText>

        {done ? (
          <View style={styles.doneRow}>
            <RubyText style={[styles.badge, { color: theme.success }]}>{`✓ ${t.doneBadge}`}</RubyText>
            <BigButton
              variant="quiet"
              label={t.undo}
              accessibilityLabel={a11yUndo(spoken)}
              onPress={onUndo}
            />
          </View>
        ) : (
          onDone && (
            <BigButton label={doneLabel} accessibilityLabel={a11yDone(spoken)} onPress={onDone} />
          )
        )}
      </View>

      {/* できたあとに、気持ちをえらべる（えらばなくてもよい） */}
      {done && onMood && (
        <View style={styles.moodArea}>
          <RubyText style={[styles.moodQuestion, { color: theme.text }]}>{t.moodQuestion}</RubyText>
          <View style={styles.moodRow}>
            {MOODS.map((m) => (
              <BigButton
                key={m}
                variant={mood === m ? 'primary' : 'secondary'}
                selected={mood === m}
                label={moodLabel[m]}
                onPress={() => onMood(m)}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  topRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  label: {
    fontSize: FontSize.heading,
    fontWeight: '700',
    flexShrink: 1,
  },
  doneRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  badge: {
    fontSize: FontSize.button,
    fontWeight: '700',
  },
  moodArea: {
    gap: Spacing.two,
  },
  moodQuestion: {
    fontSize: FontSize.body,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
