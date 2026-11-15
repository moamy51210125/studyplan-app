import { StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/big-button';
import { FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTodayText } from '@/hooks/use-today-text';
import type { Mood } from '@/types/plan';

interface SubjectCardProps {
  label: string;
  done: boolean;
  /** 未完了のときに「できた！」を押したとき（無ければボタンを出さない） */
  onDone?: () => void;
  onUndo: () => void;
  /** できたあとの気持ち（未選択なら undefined） */
  mood?: Mood;
  onMood?: (mood: Mood) => void;
}

const MOODS: Mood[] = ['good', 'ok', 'hard'];

/** 教科1つ分のカード。できたかどうかは色だけでなく文字と ✓ でも示す */
export function SubjectCard({ label, done, onDone, onUndo, mood, onMood }: SubjectCardProps) {
  const theme = useTheme();
  const t = useTodayText();
  const moodLabel = { good: t.moodGood, ok: t.moodOk, hard: t.moodHard };

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
        <Text
          style={[styles.label, { color: theme.text }]}
          accessibilityLabel={done ? t.a11yDoneState(label) : label}>
          {label}
        </Text>

        {done ? (
          <View style={styles.doneRow}>
            <Text style={[styles.badge, { color: theme.success }]}>✓ {t.doneBadge}</Text>
            <BigButton
              variant="quiet"
              label={t.undo}
              accessibilityLabel={t.a11yUndo(label)}
              onPress={onUndo}
            />
          </View>
        ) : (
          onDone && (
            <BigButton label={t.doneButton} accessibilityLabel={t.a11yDone(label)} onPress={onDone} />
          )
        )}
      </View>

      {/* できたあとに、気持ちをえらべる（えらばなくてもよい） */}
      {done && onMood && (
        <View style={styles.moodArea}>
          <Text style={[styles.moodQuestion, { color: theme.text }]}>{t.moodQuestion}</Text>
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
