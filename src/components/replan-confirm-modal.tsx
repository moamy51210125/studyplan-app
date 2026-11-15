import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '@/components/big-button';
import { FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDateShort, TODAY_TEXT } from '@/strings/today';
import type { PlanChange, SubjectId } from '@/types/plan';

/** 一度に見せる変更の数（多すぎると子どもが読みきれない） */
const MAX_SHOWN = 5;

interface ReplanConfirmModalProps {
  visible: boolean;
  title: string;
  body: string;
  changes: PlanChange[];
  labelOf: (id: SubjectId) => string;
  onAccept: () => void;
  onKeep: () => void;
}

/** 組み直しの案を見せて「いいよ」「かえない」をえらんでもらう画面 */
export function ReplanConfirmModal({
  visible,
  title,
  body,
  changes,
  labelOf,
  onAccept,
  onKeep,
}: ReplanConfirmModalProps) {
  const theme = useTheme();
  const shown = changes.slice(0, MAX_SHOWN);
  const rest = changes.length - shown.length;
  const name = (id: SubjectId | null) => (id === null ? '—' : labelOf(id));

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onKeep}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
            {title}
          </Text>
          <Text style={[styles.body, { color: theme.text }]}>{body}</Text>

          {shown.map((c) => (
            <View
              key={`${c.date}#${c.order}`}
              style={[styles.row, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <Text style={[styles.date, { color: theme.textSecondary }]}>{formatDateShort(c.date)}</Text>
              <Text style={[styles.change, { color: theme.text }]}>
                {name(c.from)} → {name(c.to)}
              </Text>
            </View>
          ))}
          {rest > 0 && (
            <Text style={[styles.body, { color: theme.textSecondary }]}>{TODAY_TEXT.replanMore(rest)}</Text>
          )}

          <BigButton label={TODAY_TEXT.replanOk} onPress={onAccept} />
          <BigButton variant="secondary" label={TODAY_TEXT.replanKeep} onPress={onKeep} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    fontSize: FontSize.heading,
    fontWeight: '700',
  },
  body: {
    fontSize: FontSize.body,
    lineHeight: 28,
  },
  row: {
    borderWidth: 2,
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  date: {
    fontSize: FontSize.body,
  },
  change: {
    fontSize: FontSize.button,
    fontWeight: '700',
  },
});
