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
  weeklyTotal: (n: number) => `1週間で ${n}回`,
  setupSlotsTitle: '1日の回数',
  setupSlotsIntro:
    'お子さまが1日にいくつの教科を勉強するかを、曜日ごとに決めてください。習い事のある日は少なめにするなど、ご家庭に合わせて調整できます。あとから保護者モードでいつでも変えられます。',
  setupNext: '決定して次へ',
  decrease: (day: string) => `${day}の回数を減らす`,
  increase: (day: string) => `${day}の回数を増やす`,

  approvalSettingTitle: '予定変更の保護者確認',
  approvalSettingNote:
    'オンにすると、お子さまが了承した予定の変更は、ここで「反映する」を押すまで反映されません。',

  replanned: '明日以降の予定を作り直しました。',

  // カレンダー
  prevMonth: '前の月',
  nextMonth: '次の月',
  calendarMonth: (y: number, m: number) => `${y}年${m}月`,

  restTitle: 'お休みの日',
  restNote:
    '日付をタップすると、お休みにします（明日以降）。お休みの日の分は、ほかの日の量を増やさず、残りの日で教科が偏らないように割り振り直します。',
  restMark: '休',
  restA11y: (date: string, on: boolean) => `${date}${on ? '、お休み' : ''}`,
  restCount: (n: number) => `お休みの日：${n}日`,

  examsTitle: '試験日（漢検・英検）',
  examsNote:
    '試験日の30日前から少し多め、14日前からさらに多めに計画に入れます。登録した教科は計画に入ります。',
  examSubject: '教科',
  examGrade: '級',
  examGradePlaceholder: '例：5級',
  examDate: '試験日（カレンダーで選んでください）',
  examDateChosen: (date: string) => `試験日：${date}`,
  examMark: '✓',
  examAdd: '登録',
  examRemove: '削除',
  examRemoveA11y: (name: string) => `${name}の試験を削除`,
  examItem: (name: string, grade: string, date: string) => `${name}　${grade}　${date}`,
  examDaysLeft: (n: number) => (n > 0 ? `あと${n}日` : n === 0 ? '本日' : '終了'),
  examNone: '登録されている試験はありません。',
  examNeedAll: '教科・級・試験日をすべて入力してください。',

  gradeTitle: '学年',
  gradeNote:
    '学年に合わせて、お子さまの画面の教科名を漢字で表示するかを切り替えます（未設定のときはひらがな）。',
  gradeValue: (n: number) => `${n}年生`,
  gradeUnset: '未設定',

  appearanceTitle: '画面の色',
  appearanceNote: '「スマホに合わせる」にすると、スマホのダークモードの設定に合わせて切り替わります。',
  appearanceLight: '白',
  appearanceDark: 'ダーク',
  appearanceSystem: 'スマホに合わせる',
} as const;

export const WEEKDAY_NAMES = ['日曜', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜'] as const;

/** 1日の回数の上限 */
export const MAX_SLOTS_PER_DAY = 5;

/** 例：11月16日（月） */
export function formatDateParent(date: DateKey): string {
  const [, m, d] = date.split('-').map(Number);
  return `${m}月${d}日（${WEEKDAY_NAMES[weekdayOf(date)].slice(0, 1)}）`;
}
