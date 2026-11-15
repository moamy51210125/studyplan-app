/**
 * アプリの色・文字・すき間。
 * 白（light）とダーク（dark）の2つ。どちらを使うかは保護者モードで選ぶ（はじめは白）。
 * どちらも温かみのある色にする（ユーザー決定 2026-11-15）。
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
  dark: {
    /** クリーム色の文字（背景に対して 14.8） */
    text: '#F6EBDD',
    textSecondary: '#CDB7A0',
    /** 真っ黒ではなく、温かみのある濃い茶色 */
    background: '#1F1914',
    backgroundElement: '#2C231C',
    backgroundSelected: '#3B2F26',
    border: '#5E4A39',
    /** やわらかいオレンジ（上の文字は濃い茶色で 8.6） */
    tint: '#F2A766',
    onTint: '#2A1608',
    success: '#93D69D',
    successBackground: '#1E3322',
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
