import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '@/components/big-button';
import { FontSize, MaxContentWidth, MinTouchSize, Spacing } from '@/constants/theme';
import { useStudyData } from '@/hooks/use-study-data';
import { useTheme } from '@/hooks/use-theme';
import {
  createForgotQuestion,
  createSalt,
  hashPin,
  isValidPin,
  LOCK_MS,
  MAX_FAILURES,
  verifyPin,
} from '@/parent/pin';
import { unlockParent } from '@/parent/session';
import { PARENT_TEXT } from '@/strings/parent';

type Mode = 'enter' | 'create' | 'confirm' | 'forgot';

/**
 * 保護者モードの入口：暗証番号の入力・作成・忘れたとき。
 * ?setup=1 のときは、最初の起動時の設定（やめるボタンを出さない）。
 */
export default function ParentGateScreen() {
  const theme = useTheme();
  const { data, commit } = useStudyData();
  const isSetup = useLocalSearchParams<{ setup?: string }>().setup === '1';
  const [mode, setMode] = useState<Mode | null>(null);
  const [input, setInput] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [message, setMessage] = useState('');
  const [question, setQuestion] = useState(() => createForgotQuestion());
  const failures = useRef(0);
  const lockedUntil = useRef(0);

  if (!data) return null;
  const current: Mode = mode ?? (data.parent ? 'enter' : 'create');

  const goTo = (next: Mode, msg = '') => {
    setMode(next);
    setInput('');
    setMessage(msg);
  };

  /** 最初の起動の設定なら、次は1日の回数を決める画面へ */
  const openParentMode = (next: '/parent' | '/setup-slots' = '/parent') => {
    unlockParent();
    router.replace(next);
  };

  const submit = () => {
    switch (current) {
      case 'enter': {
        const now = Date.now();
        if (now < lockedUntil.current) {
          setMessage(PARENT_TEXT.gateLocked(Math.ceil((lockedUntil.current - now) / 1000)));
          return;
        }
        if (data.parent && verifyPin(input, data.parent.pinSalt, data.parent.pinHash)) {
          failures.current = 0;
          openParentMode();
          return;
        }
        failures.current += 1;
        if (failures.current >= MAX_FAILURES) {
          failures.current = 0;
          lockedUntil.current = now + LOCK_MS;
          goTo('enter', PARENT_TEXT.gateLocked(LOCK_MS / 1000));
        } else {
          goTo('enter', PARENT_TEXT.gateWrong);
        }
        return;
      }
      case 'create':
        if (!isValidPin(input)) return;
        setFirstPin(input);
        goTo('confirm');
        return;
      case 'confirm': {
        if (input !== firstPin) {
          goTo('create', PARENT_TEXT.gateMismatch);
          return;
        }
        const salt = createSalt();
        commit({
          ...data,
          parent: {
            pinHash: hashPin(input, salt),
            pinSalt: salt,
            requireApproval: data.parent?.requireApproval ?? false,
          },
        });
        openParentMode(isSetup ? '/setup-slots' : '/parent');
        return;
      }
      case 'forgot':
        if (Number(input) === question.a * question.b) {
          goTo('create');
        } else {
          setQuestion(createForgotQuestion());
          goTo('forgot', PARENT_TEXT.gateForgotWrong);
        }
        return;
    }
  };

  const isPinMode = current !== 'forgot';
  const prompt = {
    enter: PARENT_TEXT.gateEnterPin,
    create: PARENT_TEXT.gateCreatePin,
    confirm: PARENT_TEXT.gateConfirmPin,
    forgot: PARENT_TEXT.gateForgotBody,
  }[current];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['bottom', 'left', 'right']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: isSetup ? PARENT_TEXT.setupTitle : PARENT_TEXT.gateTitle,
          // 最初の設定では戻れないようにする
          headerBackVisible: !isSetup,
          gestureEnabled: !isSetup,
        }}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {isSetup && current === 'create' && (
          <Text style={[styles.body, { color: theme.text }]}>{PARENT_TEXT.setupIntro}</Text>
        )}
        <Text style={[styles.body, { color: theme.text }]}>{prompt}</Text>
        {current === 'forgot' && (
          <Text style={[styles.question, { color: theme.text }]}>
            {PARENT_TEXT.gateForgotQuestion(question.a, question.b)}
          </Text>
        )}

        <TextInput
          key={current}
          value={input}
          onChangeText={(t) => setInput(t.replace(/\D/g, '').slice(0, isPinMode ? 4 : 5))}
          onSubmitEditing={submit}
          keyboardType="number-pad"
          secureTextEntry={isPinMode}
          autoFocus
          accessibilityLabel={isPinMode ? PARENT_TEXT.pinLabel : PARENT_TEXT.answerLabel}
          style={[
            styles.input,
            { color: theme.text, borderColor: theme.border, backgroundColor: theme.backgroundElement },
          ]}
        />

        {message !== '' && (
          <Text accessibilityRole="alert" style={[styles.body, { color: theme.text }]}>
            {message}
          </Text>
        )}

        <BigButton label={PARENT_TEXT.submit} onPress={submit} />
        {current === 'enter' && (
          <BigButton variant="quiet" label={PARENT_TEXT.gateForgot} onPress={() => goTo('forgot')} />
        )}
        {!isSetup && (
          <BigButton variant="quiet" label={PARENT_TEXT.cancel} onPress={() => router.back()} />
        )}
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
    fontSize: FontSize.body,
    lineHeight: 28,
  },
  question: {
    fontSize: FontSize.title,
    fontWeight: '700',
    textAlign: 'center',
  },
  input: {
    minHeight: MinTouchSize,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    fontSize: FontSize.title,
    letterSpacing: 8,
    textAlign: 'center',
  },
});
