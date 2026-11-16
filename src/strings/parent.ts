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

  amountTitle: '教科ごとの量',
  amountNote:
    '多めにしたい教科、少なめにしたい教科を選べます。少なめ＝ふつうの半分、多め＝ふつうの1.5倍くらいの割合で計画に入ります。変えると、明日以降の予定を作り直します。',
  amountLess: '少なめ',
  amountNormal: 'ふつう',
  amountMore: '多め',
  amountA11y: (subject: string, amount: string) => `${subject}を${amount}にする`,

  notesTitle: '教科ごとの一言（任意）',
  notesNote:
    'お子さまの画面で、教科名の下に出る一言です（例：ドリル1ページ、音読2回）。何をすればよいかが分かると、ひとりで取り組みやすくなります。空にすると出ません。お子さまが読めることば（ひらがな等）で書くと読みやすくなります。',
  notesPlaceholder: '例：ドリル1ページ',
  notesA11y: (subject: string) => `${subject}の一言`,

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

  dataResetTitle: '保存データを読み込めませんでした',
  dataResetBody:
    '前の記録と設定が読み込めなかったため、はじめから始めています。元のデータは端末の中に別に残してあります。バックアップファイルがある場合は、保護者モードの「データの保存（バックアップ）」の「読み込む」で戻せます。',
  dataResetDismiss: '確認しました',

  missedTitle: 'やらなかった予定の埋め合わせ',
  missedNote:
    '前の日までにやらなかった予定は、次の日から月末までの予定に入れ直します。そのとき、お子さまに確認するかを選べます。毎日確認が出ると、できなかったことを責められているように感じることがあるため、「自動」をおすすめします。',
  missedAuto: '自動（おすすめ）',
  missedAsk: 'お子さまに確認する',

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
  restModeDay: '1日ずつ',
  restModePeriod: '期間でまとめて',
  rangeStartHint: '始まりの日をタップしてください。',
  rangeEndHint: (date: string) => `始まり：${date}。終わりの日をタップしてください。`,
  rangeStartMark: '始',
  rangeCancel: 'えらび直す',
  restRangeAdded: (from: string, to: string) => `${from}〜${to}をお休みにしました。`,
  restRangeRemoved: (from: string, to: string) => `${from}〜${to}のお休みを外しました。`,

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

  homeworkTitle: '学校の宿題',
  homeworkNote:
    'お子さまと相談して、毎日の宿題を登録してください。月曜〜金曜に、お子さまの画面のいちばん上に出て、チェックできます（お休みの日には出ません）。計画の回数やふりかえりには入りません。お子さまが読めることば（ひらがな等）で書くと読みやすくなります。',
  homeworkLabel: '宿題を追加',
  homeworkPlaceholder: '例：けいさんドリル、おんどく',
  homeworkAdd: '追加',
  homeworkRemove: '削除',
  homeworkRemoveA11y: (name: string) => `宿題「${name}」を削除`,
  homeworkNone: '登録されている宿題はありません。',
  breaksTitle: '学校のお休み（夏休みなど）',
  breaksNote:
    'この期間は宿題を出しません。勉強の予定はそのまま続きます（予定もお休みにしたいときは「お休みの日」を使ってください）。',
  breaksAdd: '学校のお休みを追加',
  breakItem: (from: string, to: string) => `${from}〜${to}`,
  breakRemoveA11y: (from: string, to: string) => `${from}〜${to}の学校のお休みを削除`,
  breakMark: '休',

  rewardTitle: 'スタンプとごほうび（任意）',
  rewardNote:
    'その日の勉強の予定と宿題がぜんぶできたら、スタンプが1つたまります。「スタンプ○個で□□」というごほうびを、お子さまと相談して決められます。オフのときは、お子さまの画面にスタンプを出しません。',
  rewardSwitch: 'スタンプとごほうびを使う',
  rewardDefaultLabel: 'すきな おやつ',
  rewardGoalLabel: 'スタンプいくつで、ごほうびにするか',
  rewardGoalValue: (n: number) => `${n}個`,
  rewardGoalRange: (min: number, max: number) => `${min}〜${max}個で決められます。`,
  rewardGoalDecrease: 'スタンプの数を減らす',
  rewardGoalIncrease: 'スタンプの数を増やす',
  rewardLabelLabel: 'ごほうびの中身（お子さまの画面に出ます）',
  rewardLabelPlaceholder: '例：すきな おやつ、こうえんに いく',
  rewardProgress: (n: number, goal: number) => `今のスタンプ：${n} / ${goal}個`,
  rewardReached: 'スタンプがたまりました。ごほうびを渡したら、下のボタンを押してください。',
  rewardGive: 'ごほうびを渡した（スタンプを数え直す）',

  gradeTitle: '学年',
  gradeNote:
    '学年に合わせて、お子さまの画面の教科名を漢字で表示するかを切り替えます（未設定のときはひらがな）。',
  gradeValue: (n: number) => `${n}年生`,
  gradeUnset: '未設定',

  backupTitle: 'データの保存（バックアップ）',
  backupNote:
    'アプリを削除したり、スマホを買いかえたりすると、記録や設定は消えてしまいます。ときどき「書き出す」でバックアップファイルを作り、ファイルアプリやクラウドなどに保存してください。ファイルにはお子さまの学習記録と設定がふくまれるので、保存先にご注意ください。',
  backupExport: '書き出す',
  backupImport: '読み込む',
  backupLast: (date: string) => `最後に書き出した日：${date}`,
  backupNever: 'まだ書き出していません。',
  backupShareTitle: 'バックアップファイルの保存先',
  backupUnavailable: 'この端末ではファイルを共有できません。',
  backupExportFailed: '書き出しに失敗しました。もう一度お試しください。',
  backupImportFailed: 'ファイルを読み込めませんでした。もう一度お試しください。',
  backupConfirmTitle: 'データを読み込みますか？',
  backupConfirmBody: (date: string) =>
    `${date}に書き出したデータで、今の記録と設定をすべて置きかえます。暗証番号も、書き出したときのものに戻ります。この操作は取り消せません。`,
  backupConfirmOk: '読み込む',
  backupConfirmCancel: 'やめる',
  backupNotBackup: 'このファイルは、このアプリのバックアップではないか、こわれています。',
  backupNewer: 'このファイルは新しいバージョンのアプリで作られたため、読み込めません。アプリを最新にしてからお試しください。',
  backupRestored: 'データを読み込みました。',
  errorDetail: (detail: string) => `（くわしい内容：${detail}）`,

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
