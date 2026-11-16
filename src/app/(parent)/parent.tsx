import { Redirect, router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '@/components/big-button';
import { AmountSection } from '@/components/parent/amount-section';
import { AppearanceSection } from '@/components/parent/appearance-section';
import { BackupSection } from '@/components/parent/backup-section';
import { ExamsSection } from '@/components/parent/exams-section';
import { GradeSection } from '@/components/parent/grade-section';
import { HomeworkSection } from '@/components/parent/homework-section';
import { RestDaysSection } from '@/components/parent/rest-days-section';
import { Section } from '@/components/parent/section';
import { SlotsEditor } from '@/components/parent/slots-editor';
import { FontSize, MaxContentWidth, MinTouchSize, Spacing } from '@/constants/theme';
import { useStudyData } from '@/hooks/use-study-data';
import { useTheme } from '@/hooks/use-theme';
import { isParentUnlocked, lockParent } from '@/parent/session';
import {
  addCustomSubject,
  applyApproval,
  applySettingsChange,
  isApprovalStale,
  setSubjectEnabled,
} from '@/planner';
import { formatDateParent, PARENT_TEXT } from '@/strings/parent';
import { subjectLabelForParent } from '@/strings/subjects';
import type { PlanSettings, SubjectId } from '@/types/plan';

const MAX_SHOWN_CHANGES = 5;
const MAX_SUBJECT_NAME = 12;

/** 保護者モード：確認待ちの変更、宿題、教科、曜日ごとの回数、お休みの日、試験日、学年、保護者確認の設定 */
export default function ParentScreen() {
  const theme = useTheme();
  const { today, data, commit } = useStudyData();
  const [notice, setNotice] = useState('');
  const [newSubject, setNewSubject] = useState('');

  // 画面を離れたら保護者モードを閉じる
  useEffect(() => () => lockParent(), []);

  if (!isParentUnlocked()) return <Redirect href="/parent-gate" />;
  if (!data) return null;

  const labelOf = (id: SubjectId) => {
    const s = data.settings.subjects.find((x) => x.id === id);
    return s ? subjectLabelForParent(s) : id;
  };

  /** 設定を変え、明日以降の予定を作り直す（古い確認待ちは前提が変わるので消す） */
  const updateSettings = (settings: PlanSettings) => {
    const plan = applySettingsChange(settings, data.plan, data.records, today);
    commit({ ...data, settings, plan, pendingApproval: undefined });
    setNotice(PARENT_TEXT.replanned);
  };

  const enabledCount = data.settings.subjects.filter((s) => s.enabled).length;
  const pending = data.pendingApproval;
  const pendingStale = pending !== undefined && isApprovalStale(pending, today);

  const applyPending = () => {
    if (!pending) return;
    const plan = applyApproval(data.plan, pending, today);
    commit({ ...data, plan: plan ?? data.plan, pendingApproval: undefined });
  };

  const addSubject = () => {
    const name = newSubject.trim();
    if (name === '') return;
    updateSettings({ ...data.settings, subjects: addCustomSubject(data.settings.subjects, name) });
    setNewSubject('');
  };


  const text = { color: theme.text };
  const sub = { color: theme.textSecondary };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['bottom', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: true, title: PARENT_TEXT.homeTitle }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {notice !== '' && (
          <Text accessibilityRole="alert" style={[styles.notice, { color: theme.text, backgroundColor: theme.successBackground }]}>
            {notice}
          </Text>
        )}

        {pending && (
          <Section title={PARENT_TEXT.approvalTitle}>
            {pendingStale ? (
              <>
                <Text style={[styles.body, text]}>{PARENT_TEXT.approvalStale}</Text>
                <BigButton variant="secondary" label={PARENT_TEXT.approvalDiscard} onPress={() => commit({ ...data, pendingApproval: undefined })} />
              </>
            ) : (
              <>
                <Text style={[styles.body, text]}>{PARENT_TEXT.approvalBody(formatDateParent(pending.createdOn))}</Text>
                {pending.changes.slice(0, MAX_SHOWN_CHANGES).map((c) => (
                  <Text key={`${c.date}#${c.order}`} style={[styles.body, text]}>
                    {formatDateParent(c.date)}　{c.from ? labelOf(c.from) : '—'} → {c.to ? labelOf(c.to) : '—'}
                  </Text>
                ))}
                {pending.changes.length > MAX_SHOWN_CHANGES && (
                  <Text style={[styles.body, sub]}>{PARENT_TEXT.approvalMore(pending.changes.length - MAX_SHOWN_CHANGES)}</Text>
                )}
                <BigButton label={PARENT_TEXT.approvalApply} onPress={applyPending} />
                <BigButton variant="secondary" label={PARENT_TEXT.approvalReject} onPress={() => commit({ ...data, pendingApproval: undefined })} />
              </>
            )}
          </Section>
        )}

        {/* 宿題は計画の枠とは別なので、予定は作り直さない */}
        <HomeworkSection
          items={data.homework ?? []}
          checks={data.homeworkChecks ?? []}
          onChange={(homework, homeworkChecks) => commit({ ...data, homework, homeworkChecks })}
        />

        <Section title={PARENT_TEXT.subjectsTitle} note={PARENT_TEXT.subjectsNote}>
          {data.settings.subjects.map((s) => {
            const label = subjectLabelForParent(s);
            // 最後の1教科はオフにできない（計画が空になるため）
            const locked = s.enabled && enabledCount === 1;
            return (
              <View key={s.id} style={[styles.row, { borderColor: theme.border }]}>
                <Text style={[styles.rowLabel, text]}>{label}</Text>
                <Switch
                  accessibilityLabel={label}
                  value={s.enabled}
                  disabled={locked}
                  onValueChange={(v) =>
                    updateSettings({ ...data.settings, subjects: setSubjectEnabled(data.settings.subjects, s.id, v) })
                  }
                />
              </View>
            );
          })}
          <Text style={[styles.body, text]}>{PARENT_TEXT.addSubjectLabel}</Text>
          <View style={styles.addRow}>
            <TextInput
              value={newSubject}
              onChangeText={(t) => setNewSubject(t.slice(0, MAX_SUBJECT_NAME))}
              onSubmitEditing={addSubject}
              placeholder={PARENT_TEXT.addSubjectPlaceholder}
              placeholderTextColor={theme.textSecondary}
              accessibilityLabel={PARENT_TEXT.addSubjectLabel}
              style={[styles.input, text, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}
            />
            <BigButton variant="secondary" label={PARENT_TEXT.addSubject} onPress={addSubject} />
          </View>
        </Section>

        <AmountSection settings={data.settings} onChange={updateSettings} />

        <Section title={PARENT_TEXT.slotsTitle} note={PARENT_TEXT.slotsNote}>
          <SlotsEditor
            value={data.settings.slotsPerWeekday}
            onChange={(slotsPerWeekday) => updateSettings({ ...data.settings, slotsPerWeekday })}
          />
        </Section>

        <RestDaysSection settings={data.settings} today={today} onChange={updateSettings} />

        <ExamsSection settings={data.settings} today={today} onChange={updateSettings} />

        {/* 学年と画面の色は表示だけに使うので、予定は作り直さない */}
        <GradeSection grade={data.grade} onChange={(grade) => commit({ ...data, grade })} />
        <AppearanceSection
          appearance={data.appearance}
          onChange={(appearance) => commit({ ...data, appearance })}
        />

        <BackupSection data={data} today={today} commit={commit} />

        {data.parent && (
          <Section title={PARENT_TEXT.approvalSettingTitle} note={PARENT_TEXT.approvalSettingNote}>
            <View style={[styles.row, { borderColor: theme.border }]}>
              <Text style={[styles.rowLabel, text]}>{PARENT_TEXT.approvalSettingTitle}</Text>
              <Switch
                accessibilityLabel={PARENT_TEXT.approvalSettingTitle}
                value={data.parent.requireApproval}
                onValueChange={(v) => data.parent && commit({ ...data, parent: { ...data.parent, requireApproval: v } })}
              />
            </View>
          </Section>
        )}

        <BigButton
          label={PARENT_TEXT.backToChild}
          onPress={() => {
            lockParent();
            // 最初の設定から来たときは戻る先がないので、子ども画面を開く
            if (router.canGoBack()) router.back();
            else router.replace('/');
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  notice: {
    fontSize: 16,
    padding: Spacing.three,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    minHeight: MinTouchSize,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    borderBottomWidth: 1,
    paddingVertical: Spacing.one,
  },
  rowLabel: {
    fontSize: FontSize.body,
    flexShrink: 1,
  },
  addRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: MinTouchSize,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    fontSize: FontSize.body,
  },
});
