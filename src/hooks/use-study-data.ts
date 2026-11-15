import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import {
  createDefaultSettings,
  ensureMonthPlan,
  type ReplanResult,
  reviewMissed,
  toDateKey,
} from '@/planner';
import { type AppData, loadAppData, saveAppData } from '@/storage/app-data';
import type { DateKey } from '@/types/plan';

/** 端末の「今日」。アプリに戻ってきたときに日付が変わっていれば更新する */
export function useToday(): DateKey {
  const [today, setToday] = useState(() => toDateKey(new Date()));
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setToday(toDateKey(new Date()));
    });
    return () => sub.remove();
  }, []);
  return today;
}

function createEmptyData(): AppData {
  return { version: 1, settings: createDefaultSettings(), plan: [], plannedMonths: [], records: [] };
}

/**
 * 保存データを読み、今日の月の計画が無ければ作る。
 * その日はじめて開いたときは、やらなかった予定の埋め合わせ案（missedReview）を用意する。
 * commit で新しいデータを画面に反映し、端末に保存する。
 */
export function useStudyData(today: DateKey) {
  const [data, setData] = useState<AppData | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [missedReview, setMissedReview] = useState<ReplanResult | null>(null);

  const commit = useCallback((next: AppData) => {
    setData(next);
    saveAppData(next).then(
      () => setSaveError(false),
      () => setSaveError(true),
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = (await loadAppData().catch(() => null)) ?? createEmptyData();
      const month = ensureMonthPlan(loaded.settings, loaded.plan, loaded.plannedMonths, today);
      const next: AppData = { ...loaded, ...month, lastOpenedDate: today };
      if (cancelled) return;
      commit(next);

      // はじめて使う日は見直さない。その日2回目以降も見直さない
      const firstOpenToday = loaded.lastOpenedDate !== undefined && loaded.lastOpenedDate < today;
      if (firstOpenToday) {
        const review = reviewMissed({
          settings: next.settings,
          currentPlan: next.plan,
          records: next.records,
          today,
        });
        setMissedReview(review.changes.length > 0 ? review : null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [today, commit]);

  const dismissMissedReview = useCallback(() => setMissedReview(null), []);

  return { data, commit, saveError, missedReview, dismissMissedReview };
}
