import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { createDefaultSettings, ensureMonthPlan, toDateKey } from '@/planner';
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
 * commit で新しいデータを画面に反映し、端末に保存する。
 */
export function useStudyData(today: DateKey) {
  const [data, setData] = useState<AppData | null>(null);
  const [saveError, setSaveError] = useState(false);

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
      if (!cancelled) commit({ ...loaded, ...month });
    })();
    return () => {
      cancelled = true;
    };
  }, [today, commit]);

  return { data, commit, saveError };
}
