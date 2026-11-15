import { Redirect, router, Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '@/components/big-button';
import { SlotsEditor } from '@/components/parent/slots-editor';
import { FontSize, MaxContentWidth, Spacing } from '@/constants/theme';
import { useStudyData } from '@/hooks/use-study-data';
import { useTheme } from '@/hooks/use-theme';
import { isParentUnlocked } from '@/parent/session';
import { applySettingsChange, rebuildPlannedMonths } from '@/planner';
import { PARENT_TEXT } from '@/strings/parent';
import type { SlotsPerWeekday } from '@/types/plan';

/**
 * 最初の起動の設定（暗証番号のあと）：曜日ごとの1日の回数を決める。
 * 決めたら保護者モードへ進む。
 */
export default function SetupSlotsScreen() {
  const theme = useTheme();
  const { today, data, commit } = useStudyData();
  const [slots, setSlots] = useState<SlotsPerWeekday | null>(null);

  if (!isParentUnlocked()) return <Redirect href="/parent-gate" />;
  if (!data) return null;
  const value = slots ?? data.settings.slotsPerWeekday;

  const submit = () => {
    const settings = { ...data.settings, slotsPerWeekday: value };
    // まだ記録が無ければ、今日をふくめて作り直す。記録があれば明日から作り直す
    const plan =
      data.records.length === 0
        ? rebuildPlannedMonths(settings, data.plannedMonths)
        : applySettingsChange(settings, data.plan, data.records, today);
    commit({ ...data, settings, plan });
    router.replace('/parent');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['bottom', 'left', 'right']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: PARENT_TEXT.setupSlotsTitle,
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.body, { color: theme.text }]}>{PARENT_TEXT.setupSlotsIntro}</Text>
        <SlotsEditor value={value} onChange={setSlots} />
        <BigButton label={PARENT_TEXT.setupNext} onPress={submit} />
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
  body: {
    fontSize: FontSize.body - 2,
    lineHeight: 26,
  },
});
