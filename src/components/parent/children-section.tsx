import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { BigButton } from '@/components/big-button';
import { parentStyles, Section } from '@/components/parent/section';
import { FontSize, MinTouchSize, Spacing } from '@/constants/theme';
import { useStudyData } from '@/hooks/use-study-data';
import { useTheme } from '@/hooks/use-theme';
import { createChild, MAX_CHILDREN, MAX_NICKNAME, newChildId } from '@/storage/app-data';
import { childNameForParent } from '@/strings/children';
import { PARENT_TEXT } from '@/strings/parent';
import { cleanLabel } from '@/strings/subjects';

/**
 * お子さま（きょうだい）：追加・ニックネームの変更・削除・どの子の設定をするか。
 * 保存する個人情報はニックネームだけ（.claude/rules/child-privacy.md、ユーザー決定 2026-11-16）。
 */
export function ChildrenSection() {
  const theme = useTheme();
  const { family, commitFamily, switchChild } = useStudyData();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [newName, setNewName] = useState('');
  const text = { color: theme.text };

  if (!family) return null;

  const rename = (id: string) => {
    const draft = drafts[id];
    if (draft === undefined) return;
    commitFamily({
      ...family,
      children: family.children.map((c) => (c.id === id ? { ...c, nickname: draft.trim() } : c)),
    });
    setDrafts((d) => {
      const rest = { ...d };
      delete rest[id];
      return rest;
    });
  };

  const add = () => {
    if (family.children.length >= MAX_CHILDREN) return;
    const child = createChild(newChildId(family), newName);
    commitFamily({ ...family, children: [...family.children, child] });
    setNewName('');
  };

  const remove = (id: string, name: string) => {
    // 取り消せない操作なので、必ず確認する
    Alert.alert(PARENT_TEXT.childRemoveTitle(name), PARENT_TEXT.childRemoveBody, [
      { text: PARENT_TEXT.childRemoveCancel, style: 'cancel' },
      {
        text: PARENT_TEXT.childRemoveOk,
        style: 'destructive',
        onPress: () => {
          const children = family.children.filter((c) => c.id !== id);
          const removedActive = family.activeChildId === id;
          commitFamily({ ...family, children, activeChildId: removedActive ? children[0].id : family.activeChildId });
          if (removedActive) switchChild(children[0].id);
        },
      },
    ]);
  };

  const canRemove = family.children.length > 1;

  return (
    <Section title={PARENT_TEXT.childrenTitle} note={PARENT_TEXT.childrenNote}>
      {family.children.map((child, i) => {
        const name = childNameForParent(child, i);
        const current = child.id === family.activeChildId;
        return (
          <View key={child.id} style={[styles.child, { borderColor: current ? theme.tint : theme.border }]}>
            <TextInput
              value={drafts[child.id] ?? child.nickname}
              onChangeText={(v) => setDrafts((d) => ({ ...d, [child.id]: cleanLabel(v).slice(0, MAX_NICKNAME) }))}
              onEndEditing={() => rename(child.id)}
              onSubmitEditing={() => rename(child.id)}
              placeholder={`${PARENT_TEXT.childNicknamePlaceholder}（${PARENT_TEXT.childFallback(i + 1)}）`}
              placeholderTextColor={theme.textSecondary}
              accessibilityLabel={PARENT_TEXT.childNicknameA11y(name)}
              style={[styles.input, text, { borderColor: theme.border, backgroundColor: theme.background }]}
            />
            <View style={styles.actions}>
              {current ? (
                <Text style={[styles.current, { color: theme.tint }]}>{`✓ ${PARENT_TEXT.childCurrent}`}</Text>
              ) : (
                <BigButton variant="secondary" label={PARENT_TEXT.childSelect} onPress={() => switchChild(child.id)} />
              )}
              {canRemove && (
                <BigButton
                  variant="quiet"
                  label={PARENT_TEXT.childRemove}
                  accessibilityLabel={PARENT_TEXT.childRemoveA11y(name)}
                  onPress={() => remove(child.id, name)}
                />
              )}
            </View>
          </View>
        );
      })}

      {family.children.length < MAX_CHILDREN ? (
        <>
          <Text style={[parentStyles.body, text]}>{PARENT_TEXT.childAddLabel}</Text>
          <View style={styles.addRow}>
            <TextInput
              value={newName}
              onChangeText={(v) => setNewName(cleanLabel(v).slice(0, MAX_NICKNAME))}
              onSubmitEditing={add}
              placeholder={PARENT_TEXT.childAddPlaceholder}
              placeholderTextColor={theme.textSecondary}
              accessibilityLabel={PARENT_TEXT.childAddLabel}
              style={[styles.input, styles.addInput, text, { borderColor: theme.border, backgroundColor: theme.background }]}
            />
            <BigButton variant="secondary" label={PARENT_TEXT.childAdd} onPress={add} />
          </View>
        </>
      ) : (
        <Text style={[parentStyles.body, text]}>{PARENT_TEXT.childMax(MAX_CHILDREN)}</Text>
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  child: {
    borderWidth: 2,
    borderRadius: 12,
    padding: Spacing.two,
    gap: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  current: {
    fontSize: FontSize.body,
    fontWeight: '700',
  },
  addRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  input: {
    minHeight: MinTouchSize,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    fontSize: FontSize.body,
  },
  addInput: {
    flex: 1,
  },
});
