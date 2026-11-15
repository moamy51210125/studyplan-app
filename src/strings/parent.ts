import { weekdayOf } from '@/planner/dates';
import type { DateKey } from '@/types/plan';

/** 保護者モードの文言（保護者向けなので、ふつうの丁寧な日本語） */
export const PARENT_TEXT = {
  // 暗証番号の画面
  gateTitle: '保護者の方へ',
  setupTitle: 'はじめに（保護者の方へ）',
  setupIntro:
    'このアプリは小学生のお子さま向けの学習計画アプリです。はじめに、保護者の方が設定をお願いします。教科や回数を設定する「保護者モード」に入るための暗証番号を決めます。',
  gateEnterPin: '4けたの暗証番号を入力してください。',
  gateCreatePin: '保護者モード用の4けたの暗証番号を決めてください。お子さまに見られないようにご注意ください。',
  gateConfirmPin: '確認のため、もう一度入力してください。',
  gateMismatch: '番号が一致しませんでした。最初からやり直してください。',
  gateWrong: '番号が違います。',
  gateLocked: (sec: number) => `続けて間違えたため、${sec}秒ほどお待ちください。`,
  gateForgot: '暗証番号を忘れた場合',
  gateForgotBody: '次の計算の答えを入力すると、暗証番号を決め直せます（設定や記録は消えません）。',
  gateForgotQuestion: (a: number, b: number) => `${a} × ${b} = ?`,
  gateForgotWrong: '答えが違います。',
  pinLabel: '暗証番号',
  answerLabel: '答え',
  submit: '決定',
  cancel: 'やめる',

  // 保護者モードのトップ
  homeTitle: '保護者モード',
  backToChild: '子ども画面にもどる',

  approvalTitle: '確認待ちの予定変更',
  approvalBody: (date: string) => `${date}にお子さまが了承した予定の変更です。`,
  approvalMore: (n: number) => `ほか${n}件`,
  approvalApply: '反映する',
  approvalReject: '反映しない',
  approvalStale: '月が変わったため、この変更は反映できません。',
  approvalDiscard: '閉じる',

  subjectsTitle: '計画に入れる教科',
  subjectsNote: 'オン・オフを変えると、明日以降の予定を作り直します。',
  addSubjectLabel: '教科を追加',
  addSubjectPlaceholder: '例：読書、音読',
  addSubject: '追加',

  slotsTitle: '曜日ごとの回数',
  slotsNote: '1日にいくつの教科を勉強するかです。変えると、明日以降の予定を作り直します。',
  slotsValue: (n: number) => `${n}回`,
  decrease: (day: string) => `${day}の回数を減らす`,
  increase: (day: string) => `${day}の回数を増やす`,

  approvalSettingTitle: '予定変更の保護者確認',
  approvalSettingNote:
    'オンにすると、お子さまが了承した予定の変更は、ここで「反映する」を押すまで反映されません。',

  replanned: '明日以降の予定を作り直しました。',
} as const;

export const WEEKDAY_NAMES = ['日曜', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜'] as const;

/** 1日の回数の上限 */
export const MAX_SLOTS_PER_DAY = 5;

/** 例：11月16日（月） */
export function formatDateParent(date: DateKey): string {
  const [, m, d] = date.split('-').map(Number);
  return `${m}月${d}日（${WEEKDAY_NAMES[weekdayOf(date)].slice(0, 1)}）`;
}
