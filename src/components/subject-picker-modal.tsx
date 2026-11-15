import { Modal, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '@/components/big-button';
import { FontSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTodayText } from '@/hooks/use-today-text';
import type { SubjectId } from '@/types/plan';

interface SubjectPickerModalProps {
  visible: boolean;
  subjects: { id: SubjectId; label: string }[];
  onPick: (id: SubjectId) => void;
  onCancel: () => void;
}

/** 「ちがう きょうかを やった」ときに、やった教科をえらぶ画面 */
export function SubjectPickerModal({ visible, subjects, onPick, onCancel }: SubjectPickerModalProps) {
  const theme = useTheme();
  const t = useTodayText();
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
            {t.pickerTitle}
          </Text>
          {subjects.map((s) => (
            <BigButton key={s.id} variant="secondary" label={s.label} onPress={() => onPick(s.id)} />
          ))}
          <BigButton variant="quiet" label={t.cancel} onPress={onCancel} />
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
    marginBottom: Spacing.two,
  },
});
