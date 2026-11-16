/** 日付を表す文字列（'YYYY-MM-DD'）。端末のローカル日付で作る */
export type DateKey = string;

/** 教科のID（例：'sansu'、自由に追加した教科は 'custom-1' など） */
export type SubjectId = string;

/** core: 学校の教科 / exam: 検定対策 / custom: 自分で追加した教科 */
export type SubjectKind = 'core' | 'exam' | 'custom';

/** 教科ごとの量（less: 少なめ / normal: ふつう / more: 多め） */
export type SubjectAmount = 'less' | 'normal' | 'more';

export interface Subject {
  id: SubjectId;
  kind: SubjectKind;
  /** 計画に入れるかどうか */
  enabled: boolean;
  /** 量（未設定はふつう） */
  amount?: SubjectAmount;
  /** 自由に追加した教科の表示名（core / exam は文言ファイルから表示する） */
  label?: string;
  /** 保護者が付ける一言（例：ドリル1ページ）。子ども画面のカードに出す。任意 */
  note?: string;
}

/** 0 = 日曜日 … 6 = 土曜日 */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** 曜日ごとに、1日に何回（何教科）勉強するか */
export type SlotsPerWeekday = Record<Weekday, number>;

/** 漢検・英検などの試験 */
export interface Exam {
  subjectId: SubjectId;
  date: DateKey;
  /** 受ける級（例：'5級'） */
  grade: string;
}

export interface PlanSettings {
  subjects: Subject[];
  slotsPerWeekday: SlotsPerWeekday;
  /** お休みの日 */
  restDays: DateKey[];
  exams: Exam[];
}

/** 計画の1枠（ある日の何番目に何をするか） */
export interface PlannedSlot {
  date: DateKey;
  /** その日の中での順番（0から） */
  order: number;
  subjectId: SubjectId;
}

/** きょうの気持ち（good: よかった / ok: ふつう / hard: むずかしかった） */
export type Mood = 'good' | 'ok' | 'hard';

/** 実際に勉強した記録 */
export interface StudyRecord {
  date: DateKey;
  subjectId: SubjectId;
  /** 終わったあとの気持ち（記録しなくてもよい） */
  mood?: Mood;
}

/** 組み直しで変わる1枠分の差分（null は枠が無い／無くなる） */
export interface PlanChange {
  date: DateKey;
  order: number;
  from: SubjectId | null;
  to: SubjectId | null;
}

export type SubjectCounts = Record<SubjectId, number>;

/** 学校の宿題（保護者が子どもと相談して決める。月〜金に毎日出る） */
export interface HomeworkItem {
  id: string;
  label: string;
}

/** 宿題のチェック（計画の組み直しには使わない） */
export interface HomeworkCheck {
  date: DateKey;
  homeworkId: string;
}
