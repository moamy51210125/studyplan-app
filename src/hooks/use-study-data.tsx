import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { ensureMonthPlan, type ReplanResult, reviewMissed, toDateKey } from '@/planner';
import {
  type AppData,
  applyView,
  createEmptyFamily,
  type FamilyData,
  loadFamily,
  saveFamily,
  viewOf,
} from '@/storage/app-data';
import type { DateKey } from '@/types/plan';

/** 端末の「今日」。アプリに戻ってきたときに日付が変わっていれば更新する */
function useToday(): DateKey {
  const [today, setToday] = useState(() => toDateKey(new Date()));
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setToday(toDateKey(new Date()));
    });
    return () => sub.remove();
  }, []);
  return today;
}

/**
 * 今の子どもの「その日はじめて開いたとき」の準備をする。
 * - まだ無い月の計画を作る
 * - きのうまでに やらなかった予定の埋め合わせ（自動ならそっと反映、確認するなら案を返す）
 */
function prepareActive(family: FamilyData, today: DateKey): { family: FamilyData; review: ReplanResult | null } {
  const view = viewOf(family);
  const month = ensureMonthPlan(view.settings, view.plan, view.plannedMonths, today);
  let next: AppData = { ...view, ...month, lastOpenedDate: today };
  let review: ReplanResult | null = null;

  // はじめて使う日は見直さない。その日2回目以降も見直さない
  const firstOpenToday = view.lastOpenedDate !== undefined && view.lastOpenedDate < today;
  if (firstOpenToday) {
    const r = reviewMissed({ settings: next.settings, currentPlan: next.plan, records: next.records, today });
    if (r.changes.length > 0) {
      if (next.missedReviewMode === 'ask') review = r;
      else next = { ...next, plan: r.plan }; // そっと組み直す（月の計画を作るときと同じあつかい）
    }
  }
  return { family: applyView(family, next), review };
}

interface StudyDataValue {
  today: DateKey;
  /** 今の子どものデータ＋家族共通（読み込み中は null） */
  data: AppData | null;
  /** 新しいデータを画面に反映し、端末に保存する */
  commit: (next: AppData) => void;
  /** 家族全体のデータ（きょうだいの一覧・バックアップ用） */
  family: FamilyData | null;
  /** 家族全体を置きかえる（きょうだいの追加・削除、バックアップの読み込み） */
  commitFamily: (next: FamilyData) => void;
  /** 使う子どもを切りかえる */
  switchChild: (id: string) => void;
  /** きょうだいがいるとき、アプリを開いたら「だれが つかう？」を出す */
  needsChooser: boolean;
  saveError: boolean;
  /** 端末から保存データを読み出せなかった（このときは何も保存しない） */
  loadError: boolean;
  /** その日はじめて開いたときの、やらなかった予定の埋め合わせ案（確認するときだけ） */
  missedReview: ReplanResult | null;
  dismissMissedReview: () => void;
}

const StudyDataContext = createContext<StudyDataValue | null>(null);

/**
 * 保存データをアプリ全体で1つだけ持つ。
 * （画面ごとに読み込むと、ある画面の変更を別の画面が古いデータで上書きしてしまうため）
 */
export function StudyDataProvider({ children }: { children: ReactNode }) {
  const today = useToday();
  const [family, setFamily] = useState<FamilyData | null>(null);
  const familyRef = useRef<FamilyData | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [needsChooser, setNeedsChooser] = useState(false);
  const [missedReview, setMissedReview] = useState<ReplanResult | null>(null);

  const commitFamily = useCallback((next: FamilyData) => {
    familyRef.current = next;
    setFamily(next);
    saveFamily(next).then(
      () => setSaveError(false),
      () => setSaveError(true),
    );
  }, []);

  const commit = useCallback(
    (view: AppData) => {
      const current = familyRef.current;
      if (current) commitFamily(applyView(current, view));
    },
    [commitFamily],
  );

  const switchChild = useCallback(
    (id: string) => {
      const current = familyRef.current;
      if (!current || !current.children.some((c) => c.id === id)) return;
      const prepared = prepareActive({ ...current, activeChildId: id }, today);
      commitFamily(prepared.family);
      setMissedReview(prepared.review);
      setNeedsChooser(false);
    },
    [today, commitFamily],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let result;
      try {
        result = await loadFamily();
      } catch {
        // 読み出しに失敗しただけかもしれないので、上書きせずに知らせる
        if (!cancelled) setLoadError(true);
        return;
      }
      if (cancelled) return;
      setLoadError(false);
      const loaded =
        result.kind === 'ok'
          ? result.family
          : result.kind === 'broken'
            ? { ...createEmptyFamily(), dataResetOn: today } // 元のデータは控えてある。保護者に知らせる
            : createEmptyFamily();
      const prepared = prepareActive(loaded, today);
      commitFamily(prepared.family);
      setMissedReview(prepared.review);
      setNeedsChooser(loaded.children.length >= 2);
    })();
    return () => {
      cancelled = true;
    };
  }, [today, commitFamily]);

  const dismissMissedReview = useCallback(() => setMissedReview(null), []);

  return (
    <StudyDataContext.Provider
      value={{
        today,
        data: family ? viewOf(family) : null,
        commit,
        family,
        commitFamily,
        switchChild,
        needsChooser,
        saveError,
        loadError,
        missedReview,
        dismissMissedReview,
      }}>
      {children}
    </StudyDataContext.Provider>
  );
}

export function useStudyData(): StudyDataValue {
  const value = useContext(StudyDataContext);
  if (!value) throw new Error('StudyDataProvider の中で使ってください');
  return value;
}
