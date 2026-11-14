/**
 * アプリの色・文字・すき間。ライトとダークの両方を用意する。
 * 文字と背景のコントラストは WCAG AA 以上にする（.claude/rules/kid-friendly-ui.md）。
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1A1A1A',
    textSecondary: '#55595F',
    background: '#FFFFFF',
    backgroundElement: '#F2F4F7',
    backgroundSelected: '#E0E4EA',
    border: '#C9CED6',
    /** 主なボタンの色と、その上の文字色 */
    tint: '#1F6FD1',
    onTint: '#FFFFFF',
    /** 「できた！」の色 */
    success: '#146C3C',
    successBackground: '#E3F5EA',
  },
  dark: {
    text: '#F5F5F5',
    textSecondary: '#B0B4BA',
    background: '#000000',
    backgroundElement: '#1C1D20',
    backgroundSelected: '#2E3135',
    border: '#44474D',
    tint: '#6AB0FF',
    onTint: '#0B1B2E',
    success: '#7EE2A8',
    successBackground: '#123524',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});

/** 小学生向けの文字の大きさ（本文 16 以上、ボタン 18 以上） */
export const FontSize = {
  body: 18,
  button: 20,
  heading: 24,
  title: 30,
} as const;

/** タップできる部品の最低の高さ（iOS 44pt / Android 48dp より大きめ） */
export const MinTouchSize = 56;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 800;
