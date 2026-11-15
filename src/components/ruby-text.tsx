import { StyleSheet, Text, type TextStyle, View, type ViewStyle, type StyleProp } from 'react-native';

import { baseOnly, hasRuby, kanaOnly, parseRuby } from '@/strings/ruby';

/** 文字の見た目に関わるスタイル（それ以外は外側の箱に付ける） */
const TEXT_KEYS = new Set([
  'color',
  'fontSize',
  'fontWeight',
  'fontFamily',
  'fontStyle',
  'lineHeight',
  'letterSpacing',
  'textDecorationLine',
]);

interface RubyTextProps {
  /** 「{漢字|よみ}」をふくむ文字列（todayText や subjectLabelForChild の結果） */
  children: string;
  style?: StyleProp<TextStyle>;
  accessibilityRole?: 'header' | 'alert' | 'text';
  /** 読み上げ用（省略すると、よみ（ひらがな）を読む） */
  accessibilityLabel?: string;
}

/**
 * ふりがな付きで表示する文字。
 * ふりがなが無い文字列は、ふつうの Text と同じように表示する。
 * ふりがながあるときは、漢字の上に小さな文字でよみを出す（ことばの間の空白で折り返す）。
 */
export function RubyText({ children, style, accessibilityRole, accessibilityLabel }: RubyTextProps) {
  if (!hasRuby(children)) {
    return (
      <Text style={style} accessibilityRole={accessibilityRole} accessibilityLabel={accessibilityLabel}>
        {children}
      </Text>
    );
  }

  const flat = StyleSheet.flatten(style) ?? {};
  const textStyle: Record<string, unknown> = {};
  const boxStyle: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(flat)) {
    if (TEXT_KEYS.has(k)) textStyle[k] = v;
    else if (k === 'textAlign')
      boxStyle.justifyContent = v === 'center' ? 'center' : v === 'right' ? 'flex-end' : 'flex-start';
    else boxStyle[k] = v;
  }
  const fontSize = typeof textStyle.fontSize === 'number' ? textStyle.fontSize : 16;
  const rubyStyle: TextStyle = {
    color: textStyle.color as TextStyle['color'],
    fontSize: Math.max(10, Math.round(fontSize * 0.5)),
    lineHeight: Math.max(12, Math.round(fontSize * 0.6)),
  };
  // 本文の行の高さをそろえて、ふりがなの無い部分と下の線をそろえる
  const bodyStyle = {
    ...textStyle,
    lineHeight: textStyle.lineHeight ?? Math.round(fontSize * 1.4),
  } as TextStyle;

  // ふりがなの無い部分は、空白で区切って折り返せるようにする
  const tokens = parseRuby(children).flatMap((seg) =>
    seg.ruby ? [seg] : (seg.text.match(/[^\s]+\s*|\s+/g) ?? []).map((text) => ({ text, ruby: undefined })),
  );

  return (
    <View
      accessible
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? kanaOnly(children)}
      style={[styles.row, boxStyle as ViewStyle]}>
      {tokens.map((tok, i) =>
        tok.ruby ? (
          <View key={i} style={styles.rubyUnit}>
            <Text style={rubyStyle}>{tok.ruby}</Text>
            <Text style={bodyStyle}>{tok.text}</Text>
          </View>
        ) : (
          <Text key={i} style={bodyStyle}>
            {tok.text}
          </Text>
        ),
      )}
    </View>
  );
}

/** ふりがなの印を外した文字（漢字だけ）。せまい場所などで使う */
export { baseOnly, kanaOnly };

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  rubyUnit: {
    alignItems: 'center',
  },
});
