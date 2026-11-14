import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '@/components/big-button';
import { ReplanConfirmModal } from '@/components/replan-confirm-modal';
import { SubjectCard } from '@/components/subject-card';
import { SubjectPickerModal } from '@/components/subject-picker-modal';
import { FontSize, MaxContentWidth, Spacing } from '@/constants/theme';
import { useStudyData, useToday } from '@/hooks/use-study-data';
import { useTheme } from '@/hooks/use-theme';
import {
  addRecord,
  enabledSubjectIds,
  nextStudyDay,
  removeRecord,
  replan,
  type ReplanResult,
  todayStatus,
} from '@/planner';
import { subjectLabel } from '@/strings/subjects';
import { formatDateLong, formatDateShort, TODAY_TEXT } from '@/strings/today';
import type { SubjectId } from '@/types/plan';

/** 子ども用：きょうの やること */
export default function TodayScreen() {
  const theme = useTheme();
  const today = useToday();
  const { data, commit, saveError } = useStudyData(today);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [proposal, setProposal] = useState<ReplanResult | null>(null);

  const subjects = data?.settings.subjects;
  const labelOf = useMemo(() => {
    const byId = new Map((subjects ?? []).map((s) => [s.id, s]));
    return (id: SubjectId) => {
      const s = byId.get(id);
      // 学年の設定ができるまでは、ひらがなで表示する
      return s ? subjectLabel(s, false) : id;
    };
  }, [subjects]);

  if (!data) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.body, { color: theme.text }]}>{TODAY_TEXT.loading}</Text>
      </SafeAreaView>
    );
  }

  const status = todayStatus(data.plan, data.records, today);
  const next = status.items.length === 0 ? nextStudyDay(data.plan, today) : [];

  const markDone = (id: SubjectId) => commit({ ...data, records: addRecord(data.records, today, id) });
  const undo = (id: SubjectId) => commit({ ...data, records: removeRecord(data.records, today, id) });

  const pickOther = (id: SubjectId) => {
    setPickerOpen(false);
    const records = addRecord(data.records, today, id);
    commit({ ...data, records });
    // 組み直し案を作り、変わるところがあれば「いい？」と聞く（勝手に変えない）
    const result = replan({ settings: data.settings, currentPlan: data.plan, records, today });
    if (result.changes.length > 0) setProposal(result);
  };

  const acceptReplan = () => {
    if (proposal) commit({ ...data, plan: proposal.plan });
    setProposal(null);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.date, { color: theme.textSecondary }]}>{formatDateLong(today)}</Text>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
          {TODAY_TEXT.title}
        </Text>

        {saveError && (
          <Text accessibilityRole="alert" style={[styles.body, { color: theme.text }]}>
            {TODAY_TEXT.saveError}
          </Text>
        )}

        {status.allDone && (
          <View style={[styles.banner, { backgroundColor: theme.successBackground }]}>
            <Text style={[styles.bannerText, { color: theme.success }]}>🌟 {TODAY_TEXT.allDone}</Text>
          </View>
        )}

        {status.items.length === 0 ? (
          <View style={[styles.banner, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.body, { color: theme.text }]}>{TODAY_TEXT.noPlanToday}</Text>
            {next.length > 0 && (
              <Text style={[styles.body, { color: theme.textSecondary }]}>
                {TODAY_TEXT.nextPlan(formatDateShort(next[0].date))}：
                {next.map((s) => labelOf(s.subjectId)).join('・')}
              </Text>
            )}
          </View>
        ) : (
          status.items.map((item) => (
            <SubjectCard
              key={item.slot.order}
              label={labelOf(item.slot.subjectId)}
              done={item.done}
              onDone={() => markDone(item.slot.subjectId)}
              onUndo={() => undo(item.slot.subjectId)}
            />
          ))
        )}

        {status.extras.length > 0 && (
          <>
            <Text accessibilityRole="header" style={[styles.subheading, { color: theme.text }]}>
              {TODAY_TEXT.extrasTitle}
            </Text>
            {status.extras.map((r, i) => (
              <SubjectCard
                key={`extra-${i}`}
                label={labelOf(r.subjectId)}
                done
                onUndo={() => undo(r.subjectId)}
              />
            ))}
          </>
        )}

        <View style={styles.spacer} />
        <BigButton
          variant="secondary"
          label={TODAY_TEXT.otherSubjectButton}
          onPress={() => setPickerOpen(true)}
        />
      </ScrollView>

      <SubjectPickerModal
        visible={pickerOpen}
        subjects={enabledSubjectIds(data.settings.subjects).map((id) => ({ id, label: labelOf(id) }))}
        onPick={pickOther}
        onCancel={() => setPickerOpen(false)}
      />
      <ReplanConfirmModal
        visible={proposal !== null}
        changes={proposal?.changes ?? []}
        labelOf={labelOf}
        onAccept={acceptReplan}
        onKeep={() => setProposal(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  date: {
    fontSize: FontSize.body,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: '800',
    marginBottom: Spacing.two,
  },
  subheading: {
    fontSize: FontSize.heading,
    fontWeight: '700',
    marginTop: Spacing.three,
  },
  body: {
    fontSize: FontSize.body,
    lineHeight: 28,
  },
  banner: {
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  bannerText: {
    fontSize: FontSize.button,
    fontWeight: '700',
  },
  spacer: {
    height: Spacing.three,
  },
});
