import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '@/components/big-button';
import { ReplanConfirmModal } from '@/components/replan-confirm-modal';
import { RubyText } from '@/components/ruby-text';
import { StampCard } from '@/components/stamp-card';
import { SubjectCard } from '@/components/subject-card';
import { SubjectPickerModal } from '@/components/subject-picker-modal';
import { FontSize, MaxContentWidth, Spacing } from '@/constants/theme';
import { useStudyData } from '@/hooks/use-study-data';
import { useTheme } from '@/hooks/use-theme';
import {
  addRecord,
  daysUntilExam,
  enabledSubjectIds,
  homeworkForDay,
  isApprovalStale,
  isDayComplete,
  isHomeworkDone,
  nextStudyDay,
  removeRecordAt,
  replan,
  type ReplanResult,
  rewardProgress,
  setHomeworkDone,
  setRecordMood,
  syncTodayStamp,
  todayStatus,
  upcomingExams,
} from '@/planner';
import { childNameForChild } from '@/strings/children';
import { cleanLabel, examGradeForChild, subjectLabelForChild } from '@/strings/subjects';
import { useTodayText } from '@/hooks/use-today-text';
import type { AppData } from '@/storage/app-data';
import type { Mood, SubjectId } from '@/types/plan';

/** 子ども用：きょうの やること */
export default function TodayScreen() {
  const theme = useTheme();
  const t = useTodayText();
  const {
    today,
    data,
    commit: commitRaw,
    family,
    needsChooser,
    saveError,
    loadError,
    missedReview,
    dismissMissedReview,
  } = useStudyData();
  const [pickerOpen, setPickerOpen] = useState(false);
  /** 「ちがう きょうかを やった」ときの組み直し案 */
  const [proposal, setProposal] = useState<ReplanResult | null>(null);

  const subjects = data?.settings.subjects;
  const grade = data?.grade;
  const noteOf = useMemo(() => {
    const byId = new Map((subjects ?? []).map((s) => [s.id, s.note]));
    return (id: SubjectId) => {
      const note = byId.get(id);
      return note ? cleanLabel(note) : undefined;
    };
  }, [subjects]);
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
        <RubyText
          accessibilityRole={loadError ? 'alert' : undefined}
          style={[styles.body, styles.centerText, { color: theme.text }]}>
          {loadError ? t.loadError : t.loading}
        </RubyText>
      </SafeAreaView>
    );
  }

  // 暗証番号がまだ無ければ、最初に保護者に決めてもらう（子どもが先に決めてしまわないように）
  if (!data.parent) {
    return <Redirect href={{ pathname: '/parent-gate', params: { setup: '1' } }} />;
  }

  /** その日の予定と宿題がぜんぶできたかを見て、スタンプを付け外ししてから保存する */
  const homeworkOf = (d: AppData) =>
    homeworkForDay(d.homework ?? [], today, d.settings.restDays, d.schoolBreaks ?? []);
  const commit = (next: AppData) => {
    const earned = isDayComplete(next.plan, next.records, homeworkOf(next), next.homeworkChecks ?? [], today);
    commitRaw({ ...next, stamps: syncTodayStamp(next.stamps ?? [], today, earned) });
  };

  // きょうだいがいるときは、アプリを開いたら「だれが つかう？」を出す
  if (needsChooser) return <Redirect href="/who" />;

  const siblings = family && family.children.length > 1 ? family.children : null;
  const myIndex = siblings ? Math.max(0, siblings.findIndex((c) => c.id === family?.activeChildId)) : 0;
  const myName = siblings ? childNameForChild(siblings[myIndex], myIndex, grade) : '';

  const status = todayStatus(data.plan, data.records, today);
  const next = status.items.length === 0 ? nextStudyDay(data.plan, today) : [];
  // 学校の宿題（月〜金。計画とは別に、いちばん上に出す）
  const checks = data.homeworkChecks ?? [];
  const homework = homeworkOf(data).map((h) => ({
    ...h,
    done: isHomeworkDone(checks, today, h.id),
  }));
  const dayComplete = isDayComplete(data.plan, data.records, homework, checks, today);
  const progress = data.reward ? rewardProgress((data.stamps ?? []).length, data.reward) : null;
  const rewardLabel = data.reward ? cleanLabel(data.reward.label) || t.rewardFallback : '';
  const checkHomework = (id: string, done: boolean) =>
    commit({ ...data, homeworkChecks: setHomeworkDone(checks, today, id, done) });

  const markDone = (id: SubjectId) => commit({ ...data, records: addRecord(data.records, today, id) });
  const undo = (index: number) => commit({ ...data, records: removeRecordAt(data.records, index) });
  const chooseMood = (index: number, mood: Mood) =>
    commit({ ...data, records: setRecordMood(data.records, index, mood) });

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
    ? { result: proposal, title: t.replanTitle, body: t.replanBody }
    : missedReview && !pickerOpen
      ? { result: missedReview, title: t.missedTitle, body: t.missedBody }
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
        {siblings && (
          <View style={styles.whoRow}>
            <RubyText style={[styles.whoName, { color: theme.text }]}>{`👤 ${myName}`}</RubyText>
            <BigButton
              variant="secondary"
              label={t.whoChange}
              accessibilityLabel={t.a11yWhoChange(myName)}
              onPress={() => router.push('/who')}
            />
          </View>
        )}
        <RubyText style={[styles.date, { color: theme.textSecondary }]}>{t.dateLong(today)}</RubyText>
        <RubyText accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
          {t.title}
        </RubyText>

        {saveError && (
          <RubyText accessibilityRole="alert" style={[styles.body, { color: theme.text }]}>
            {t.saveError}
          </RubyText>
        )}

        {upcomingExams(data.settings.exams, today).map((exam) => {
          const name = labelOf(exam.subjectId);
          const examGrade = examGradeForChild(exam.grade);
          const days = daysUntilExam(today, exam);
          return (
            <View
              key={`${exam.subjectId}-${exam.date}-${exam.grade}`}
              style={[styles.banner, { backgroundColor: theme.backgroundElement }]}>
              <RubyText style={[styles.bannerText, { color: theme.text }]}>
                {`🎯 ${days === 0 ? t.examToday(name, examGrade) : t.examCountdown(name, examGrade, days)}`}
              </RubyText>
            </View>
          );
        })}

        {waitingApproval && (
          <View style={[styles.banner, { backgroundColor: theme.backgroundElement }]}>
            <RubyText style={[styles.body, { color: theme.text }]}>{`⏳ ${t.waitingApproval}`}</RubyText>
          </View>
        )}

        {dayComplete && (
          <View
            style={[
              styles.banner,
              styles.doneBanner,
              { backgroundColor: theme.successBackground, borderColor: theme.success },
            ]}>
            <RubyText style={[styles.bannerText, { color: theme.text }]}>
              {progress ? `🌟 ${t.allDone} ⭐ ${t.stampGot}` : `🌟 ${t.allDone}`}
            </RubyText>
          </View>
        )}

        {progress && <StampCard progress={progress} label={rewardLabel} />}

        {homework.length > 0 && (
          <>
            <RubyText accessibilityRole="header" style={[styles.subheading, { color: theme.text }]}>
              {`📒 ${t.homeworkTitle}`}
            </RubyText>
            {homework.map((h) => (
              <SubjectCard
                key={h.id}
                kind="homework"
                label={cleanLabel(h.label)}
                done={h.done}
                onDone={() => checkHomework(h.id, true)}
                onUndo={() => checkHomework(h.id, false)}
              />
            ))}
            <RubyText accessibilityRole="header" style={[styles.subheading, { color: theme.text }]}>
              {t.planTitle}
            </RubyText>
          </>
        )}

        {status.items.length === 0 ? (
          <View style={[styles.banner, { backgroundColor: theme.backgroundElement }]}>
            <RubyText style={[styles.body, { color: theme.text }]}>{t.noPlanToday}</RubyText>
            {next.length > 0 && (
              <RubyText style={[styles.body, { color: theme.textSecondary }]}>
                {`${t.nextPlan(t.dateShort(next[0].date))}：${next.map((s) => labelOf(s.subjectId)).join('・')}`}
              </RubyText>
            )}
          </View>
        ) : (
          status.items.map(({ slot, done }) => (
            <SubjectCard
              key={slot.order}
              label={labelOf(slot.subjectId)}
              note={noteOf(slot.subjectId)}
              done={done !== null}
              onDone={() => markDone(slot.subjectId)}
              onUndo={() => done && undo(done.index)}
              mood={done?.record.mood}
              onMood={(mood) => done && chooseMood(done.index, mood)}
            />
          ))
        )}

        {status.extras.length > 0 && (
          <>
            <RubyText accessibilityRole="header" style={[styles.subheading, { color: theme.text }]}>
              {t.extrasTitle}
            </RubyText>
            {status.extras.map(({ record, index }) => (
              <SubjectCard
                key={`extra-${index}`}
                label={labelOf(record.subjectId)}
                done
                onUndo={() => undo(index)}
                mood={record.mood}
                onMood={(mood) => chooseMood(index, mood)}
              />
            ))}
          </>
        )}

        {/* 記録するボタン（カードのすぐ下） */}
        <BigButton
          variant="secondary"
          label={`✏️ ${t.otherSubjectButton}`}
          accessibilityLabel={t.a11yOtherSubject}
          onPress={() => setPickerOpen(true)}
        />

        {/* ほかの画面へ移るボタンは、横にならべて区別する */}
        <View style={[styles.navRow, { borderTopColor: theme.border }]}>
          <View style={styles.navItem}>
            <BigButton
              variant="secondary"
              label={`📅 ${t.calendarButton}`}
              accessibilityLabel={t.a11yCalendar}
              onPress={() => router.push('/calendar')}
            />
          </View>
          <View style={styles.navItem}>
            <BigButton
              variant="secondary"
              label={`📊 ${t.reviewButton}`}
              accessibilityLabel={t.a11yReview}
              onPress={() => router.push('/review')}
            />
          </View>
        </View>

        {/* 保護者モードへの入口（暗証番号で守る） */}
        <View style={styles.parentEntry}>
          <BigButton
            variant="quiet"
            label={t.parentEntry}
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
  centerText: {
    padding: Spacing.four,
    textAlign: 'center',
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  whoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  whoName: {
    fontSize: FontSize.button,
    fontWeight: '700',
    flexShrink: 1,
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
  doneBanner: {
    borderWidth: 3,
  },
  bannerText: {
    fontSize: FontSize.button,
    fontWeight: '700',
  },
  navRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.three,
    paddingTop: Spacing.four,
    borderTopWidth: 1,
  },
  navItem: {
    flexGrow: 1,
    flexBasis: 140,
  },
  parentEntry: {
    marginTop: Spacing.five,
    alignItems: 'center',
  },
});
