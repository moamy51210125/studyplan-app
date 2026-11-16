import { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { BigButton } from '@/components/big-button';
import { parentStyles, Section } from '@/components/parent/section';
import { FontSize, MinTouchSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  clampGoal,
  giveReward,
  type Reward,
  REWARD_GOAL_DEFAULT,
  REWARD_GOAL_MAX,
  REWARD_GOAL_MIN,
  rewardProgress,
  startReward,
} from '@/planner';
import { PARENT_TEXT } from '@/strings/parent';
import { cleanLabel } from '@/strings/subjects';

const MAX_REWARD_NAME = 20;

interface Props {
  reward: Reward | undefined;
  stampCount: number;
  onChange: (reward: Reward | undefined) => void;
}

/** スタンプとごほうび（任意）。オフのときは子ども画面にスタンプを出さない */
export function RewardSection({ reward, stampCount, onChange }: Props) {
  const theme = useTheme();
  const text = { color: theme.text };
  const [labelDraft, setLabelDraft] = useState<string | null>(null);
  const progress = reward ? rewardProgress(stampCount, reward) : null;

  const saveLabel = () => {
    if (!reward || labelDraft === null) return;
    onChange({ ...reward, label: labelDraft.trim() });
    setLabelDraft(null);
  };
  const setGoal = (goal: number) => reward && onChange({ ...reward, goal: clampGoal(goal) });

  return (
    <Section title={PARENT_TEXT.rewardTitle} note={PARENT_TEXT.rewardNote}>
      <View style={[styles.row, { borderColor: theme.border }]}>
        <Text style={[styles.rowLabel, text]}>{PARENT_TEXT.rewardSwitch}</Text>
        <Switch
          accessibilityLabel={PARENT_TEXT.rewardSwitch}
          value={reward !== undefined}
          onValueChange={(on) =>
            onChange(on ? startReward(stampCount, REWARD_GOAL_DEFAULT, PARENT_TEXT.rewardDefaultLabel) : undefined)
          }
        />
      </View>

      {reward && progress && (
        <>
          <Text style={[parentStyles.body, text]}>{PARENT_TEXT.rewardGoalLabel}</Text>
          <View style={styles.stepper}>
            <BigButton
              variant="secondary"
              label="−"
              accessibilityLabel={PARENT_TEXT.rewardGoalDecrease}
              onPress={() => setGoal(reward.goal - 1)}
            />
            <Text style={[styles.goal, text]}>{PARENT_TEXT.rewardGoalValue(reward.goal)}</Text>
            <BigButton
              variant="secondary"
              label="＋"
              accessibilityLabel={PARENT_TEXT.rewardGoalIncrease}
              onPress={() => setGoal(reward.goal + 1)}
            />
          </View>
          <Text style={[parentStyles.body, { color: theme.textSecondary }]}>
            {PARENT_TEXT.rewardGoalRange(REWARD_GOAL_MIN, REWARD_GOAL_MAX)}
          </Text>

          <Text style={[parentStyles.body, text]}>{PARENT_TEXT.rewardLabelLabel}</Text>
          <TextInput
            value={labelDraft ?? reward.label}
            onChangeText={(v) => setLabelDraft(cleanLabel(v).slice(0, MAX_REWARD_NAME))}
            onEndEditing={saveLabel}
            onSubmitEditing={saveLabel}
            placeholder={PARENT_TEXT.rewardLabelPlaceholder}
            placeholderTextColor={theme.textSecondary}
            accessibilityLabel={PARENT_TEXT.rewardLabelLabel}
            style={[styles.input, text, { borderColor: theme.border, backgroundColor: theme.background }]}
          />

          <Text style={[parentStyles.body, text]}>{PARENT_TEXT.rewardProgress(progress.count, progress.goal)}</Text>
          {progress.reached && (
            <>
              <Text style={[parentStyles.body, text]}>{PARENT_TEXT.rewardReached}</Text>
              <BigButton label={PARENT_TEXT.rewardGive} onPress={() => onChange(giveReward(reward))} />
            </>
          )}
        </>
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
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
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  goal: {
    fontSize: FontSize.heading,
    fontWeight: '700',
    minWidth: 80,
    textAlign: 'center',
  },
  input: {
    minHeight: MinTouchSize,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    fontSize: FontSize.body,
  },
});
