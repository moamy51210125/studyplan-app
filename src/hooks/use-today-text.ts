import { useStudyData } from '@/hooks/use-study-data';
import { type TodayText, todayText } from '@/strings/today';

/** 子どもの学年に合った、子ども画面の文言 */
export function useTodayText(): TodayText {
  const { data } = useStudyData();
  return todayText(data?.grade);
}
