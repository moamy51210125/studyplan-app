import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '@/components/big-button';
import { ReplanConfirmModal } from '@/components/replan-confirm-modal';
import { SubjectCard } from '@/components/subject-card';
import { SubjectPickerModal } from '@/components/subject-picker-modal';
import { FontSize, MaxContentWidth, Spacing } from '@/constants/theme';
import { useStudyData } from '@/hooks/use-study-data';
import { useTheme } from '@/hooks/use-theme';
import {
  addRecord,
  daysUntilExam,
  enabledSubjectIds,
  isApprovalStale,
  nextStudyDay,
  removeRecord,
  replan,
  type ReplanResult,
  todayStatus,
  upcomingExams,
} from '@/planner';
import { examGradeForChild, subjectLabelForChild } from '@/strings/subjects';
import { formatDateLong, formatDateShort, TODAY_TEXT } from '@/strings/today';
import type { SubjectId } from '@/types/plan';

/** 子ども用：きょうの やること */
export default function TodayScreen() {
  const theme = useTheme();
  const { today, data, commit, saveError, missedReview, dismissMissedReview } = useStudyData();
  const [pickerOpen, setPickerOpen] = useState(false);
  /** 「ちがう きょうかを やった」ときの組み直し案 */
  const [proposal, setProposal] = useState<ReplanResult | null>(null);

  const subjects = data?.settings.subjects;
  const grade = data?.grade;
  const labelOf = useMemo(() => {
    const byId = new Map((subjects ?? []).map((s) => [s.id, s]));
    return (id: SubjectId) => {
      const s = byId.get(id);
      // 学年に合わせて、ひらがな／漢字を切り替える（未設定ならひらがな）
      return s ? subjectLabelForChild(s, grade) : id;
    };
  }, [subjects, grade]);

  if (!data) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.body, { color: theme.text }]}>{TODAY_TEXT.loading}</Text>
      </SafeAreaView>
    );
  }

  // 暗証番号がまだ無ければ、最初に保護者に決めてもらう（子どもが先に決めてしまわないように）
  if (!data.parent) {
    return <Redirect href={{ pathname: '/parent-gate', params: { setup: '1' } }} />;
  }

  const status = todayStatus(data.plan, data.records, today);
  const next = status.items.length === 0 ? nextStudyDay(data.plan, today) : [];

  const markDone = (id: SubjectId) => commit({ ...data, records: addRecord(data.records, today, id) });
  const undo = (id: SubjectId) => commit({ ...data, records: removeRecord(data.records, today, id) });

  const pickOther = (id: SubjectId) => {
    setPickerOpen(false);
    // この組み直しは、きのうまでの埋め合わせも含めて数え直すので、古い埋め合わせ案は捨てる
    dismissMissedReview();
    const records = addRecord(data.records, today, id);
    commit({ ...data, records });
    // 組み直し案を作り、変わるところがあれば「いい？」と聞く（勝手に変えない）
    const result = replan({ settings: data.settings, currentPlan: data.plan, records, today });
    if (result.changes.length > 0) setProposal(result);
  };

  // 確認画面は一度に1つ。「ちがう きょうか」の案を優先し、なければ埋め合わせ案を出す
  const active = proposal
    ? { result: proposal, title: TODAY_TEXT.replanTitle, body: TODAY_TEXT.replanBody }
    : missedReview && !pickerOpen
      ? { result: missedReview, title: TODAY_TEXT.missedTitle, body: TODAY_TEXT.missedBody }
      : null;

  const closeProposal = () => {
    if (proposal) setProposal(null);
    else dismissMissedReview();
  };

  const acceptProposal = () => {
    if (active) {
      const { plan, changes } = active.result;
      // 保護者のかくにんがオンなら、反映せずに確認待ちにする（最新の1件だけ残す）
      commit(
        data.parent?.requireApproval
          ? { ...data, pendingApproval: { createdOn: today, plan, changes } }
          : { ...data, plan },
      );
    }
    closeProposal();
  };

  const waitingApproval =
    data.pendingApproval !== undefined && !isApprovalStale(data.pendingApproval, today);

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

        {upcomingExams(data.settings.exams, today).map((exam) => {
          const name = labelOf(exam.subjectId);
          const examGrade = examGradeForChild(exam.grade);
          const days = daysUntilExam(today, exam);
          return (
            <View
              key={`${exam.subjectId}-${exam.date}-${exam.grade}`}
              style={[styles.banner, { backgroundColor: theme.backgroundElement }]}>
              <Text style={[styles.bannerText, { color: theme.text }]}>
                🎯{' '}
                {days === 0
                  ? TODAY_TEXT.examToday(name, examGrade)
                  : TODAY_TEXT.examCountdown(name, examGrade, days)}
              </Text>
            </View>
          );
        })}

        {waitingApproval && (
          <View style={[styles.banner, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.body, { color: theme.text }]}>⏳ {TODAY_TEXT.waitingApproval}</Text>
          </View>
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

        {/* 保護者モードへの入口（暗証番号で守る） */}
        <View style={styles.parentEntry}>
          <BigButton
            variant="quiet"
            label={TODAY_TEXT.parentEntry}
            onPress={() => router.push('/parent-gate')}
          />
        </View>
      </ScrollView>

      <SubjectPickerModal
        visible={pickerOpen}
        subjects={enabledSubjectIds(data.settings.subjects).map((id) => ({ id, label: labelOf(id) }))}
        onPick={pickOther}
        onCancel={() => setPickerOpen(false)}
      />
      <ReplanConfirmModal
        visible={active !== null}
        title={active?.title ?? ''}
        body={active?.body ?? ''}
        changes={active?.result.changes ?? []}
        labelOf={labelOf}
        onAccept={acceptProposal}
        onKeep={closeProposal}
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
  parentEntry: {
    marginTop: Spacing.five,
    alignItems: 'center',
  },
});
