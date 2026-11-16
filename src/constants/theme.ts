/**
 * アプリの色・文字・すき間。
 * 白（light）とダーク（dark）の2つ。どちらを使うかは保護者モードで選ぶ（はじめは白）。
 * どちらも青系の落ち着いた色にする（ユーザー決定 2026-11-16。以前の温かみのある茶・オレンジから変更）。
 * 「できた」はオレンジ系（ユーザー決定 2026-11-16）。青の中で目立つようにする。
 * 文字と背景のコントラストは WCAG AA（4.5 以上）を計算で確認済み（.claude/rules/kid-friendly-ui.md）。
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    /** こい紺（背景に対して 13.9） */
    text: '#1B2A41',
    /** 青みのある灰色（背景に対して 6.5、カードに対して 6.0） */
    textSecondary: '#4A5D78',
    /** ほんのり青みがかった白 */
    background: '#F8FBFF',
    /** カードのうすい水色 */
    backgroundElement: '#EAF2FC',
    backgroundSelected: '#D6E6FA',
    border: '#B5CDEB',
    /** 主なボタンの青（白文字に対して 6.1） */
    tint: '#1F5FBF',
    onTint: '#FFFFFF',
    /** 「できた！」のオレンジ（うすいオレンジに対して 5.2、背景に対して 5.6） */
    success: '#A84A0A',
    successBackground: '#FFF0E2',
  },
  dark: {
    /** 青白い文字（背景に対して 15.2） */
    text: '#E8F0FB',
    textSecondary: '#AFC0D8',
    /** 真っ黒ではなく、こい紺 */
    background: '#121A26',
    backgroundElement: '#1C2636',
    backgroundSelected: '#26334A',
    border: '#3D5070',
    /** やわらかい水色（上の文字はこい紺で 7.9） */
    tint: '#7FB2F0',
    onTint: '#0B1A2E',
    /** 「できた！」のやわらかいオレンジ（こげ茶に対して 8.1） */
    success: '#FFB07A',
    successBackground: '#3A2516',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type ColorScheme = keyof typeof Colors;

/** 画面の色の設定（white = 白、dark = ダーク、system = スマホに合わせる） */
export type Appearance = 'light' | 'dark' | 'system';

/** 設定とスマホのモードから、使う色を決める（設定が無ければ白） */
export function resolveColorScheme(
  appearance: Appearance | undefined,
  system: string | null | undefined,
): ColorScheme {
  if (appearance === 'dark') return 'dark';
  if (appearance === 'system') return system === 'dark' ? 'dark' : 'light';
  return 'light';
}

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
