/**
 * アプリの色・文字・すき間。
 * スマホがダークモードでも、いつも白い背景の温かみのある色で表示する（ユーザー決定 2026-11-15）。
 * 文字と背景のコントラストは WCAG AA（4.5 以上）を計算で確認済み（.claude/rules/kid-friendly-ui.md）。
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    /** こげ茶（背景に対して 13.2） */
    text: '#3D2B1F',
    /** うすい茶（背景に対して 6.5、カードに対して 6.0） */
    textSecondary: '#75573F',
    /** ほんのりクリームがかった白 */
    background: '#FFFDF8',
    /** カードのクリーム色 */
    backgroundElement: '#FFF4E3',
    backgroundSelected: '#FFE8C7',
    border: '#E6C9A0',
    /** 主なボタンのオレンジ（白文字に対して 5.1） */
    tint: '#B84E17',
    onTint: '#FFFFFF',
    /** 「できた！」の緑（うすい緑に対して 5.9） */
    success: '#256B2A',
    successBackground: '#EAF6E4',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

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
