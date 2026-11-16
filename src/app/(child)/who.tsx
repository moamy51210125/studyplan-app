import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '@/components/big-button';
import { RubyText } from '@/components/ruby-text';
import { FontSize, MaxContentWidth, Spacing } from '@/constants/theme';
import { useStudyData } from '@/hooks/use-study-data';
import { useTheme } from '@/hooks/use-theme';
import { useTodayText } from '@/hooks/use-today-text';
import { childNameForChild } from '@/strings/children';

/**
 * 子ども用：だれが つかう？（きょうだいで使うとき）
 * 子どもが自分でえらべる（ユーザー決定 2026-11-16）。暗証番号はいらない。
 */
export default function WhoScreen() {
  const theme = useTheme();
  const t = useTodayText();
  const { family, switchChild } = useStudyData();

  if (!family) return null;

  const choose = (id: string) => {
    switchChild(id);
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <RubyText accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
          {`👤 ${t.whoTitle}`}
        </RubyText>
        {family.children.map((child, i) => {
          const name = childNameForChild(child, i, child.grade);
          const current = child.id === family.activeChildId;
          return (
            <BigButton
              key={child.id}
              variant={current ? 'primary' : 'secondary'}
              selected={current}
              label={name}
              accessibilityLabel={t.a11yWho(name)}
              onPress={() => choose(child.id)}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: '800',
    marginBottom: Spacing.two,
  },
});
