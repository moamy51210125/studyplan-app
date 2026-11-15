import { Pressable, StyleSheet } from 'react-native';

import { RubyText } from '@/components/ruby-text';
import { FontSize, MinTouchSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { kanaOnly } from '@/strings/ruby';

type Variant = 'primary' | 'secondary' | 'quiet';

interface BigButtonProps {
  /** 表示する文字（「{漢字|よみ}」のふりがなの印をふくんでもよい） */
  label: string;
  onPress: () => void;
  variant?: Variant;
  /** 読み上げ用。省略すると label を読む */
  accessibilityLabel?: string;
  /** えらばれている状態か（読み上げにも伝える） */
  selected?: boolean;
}

/** 子どもが押しやすい大きなボタン（高さ 56 以上、文字 20） */
export function BigButton({
  label,
  onPress,
  variant = 'primary',
  accessibilityLabel,
  selected,
}: BigButtonProps) {
  const theme = useTheme();
  const look = {
    primary: { backgroundColor: theme.tint, borderColor: theme.tint, color: theme.onTint },
    secondary: {
      backgroundColor: theme.backgroundElement,
      borderColor: theme.border,
      color: theme.text,
    },
    quiet: { backgroundColor: 'transparent', borderColor: 'transparent', color: theme.tint },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? kanaOnly(label)}
      accessibilityState={selected === undefined ? undefined : { selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: look.backgroundColor, borderColor: look.borderColor },
        pressed && styles.pressed,
      ]}>
      <RubyText style={[styles.label, { color: look.color }, variant === 'quiet' && styles.quietLabel]}>
        {label}
      </RubyText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MinTouchSize,
    minWidth: MinTouchSize,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: FontSize.button,
    fontWeight: '700',
    textAlign: 'center',
  },
  quietLabel: {
    fontSize: FontSize.body,
    textDecorationLine: 'underline',
  },
});
