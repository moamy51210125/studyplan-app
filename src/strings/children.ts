import type { ChildProfile } from '@/storage/app-data';

import { PARENT_TEXT } from './parent';
import { cleanLabel } from './subjects';
import { todayText } from './today';

/** 子ども画面で出すニックネーム（空なら「1にんめ」）。ふりがなの印に使う記号は取りのぞく */
export function childNameForChild(child: ChildProfile, index: number, grade?: number): string {
  const name = cleanLabel(child.nickname);
  return name !== '' ? name : todayText(grade).childFallback(index + 1);
}

/** 保護者画面で出すニックネーム（空なら「1人目」） */
export function childNameForParent(child: ChildProfile, index: number): string {
  const name = cleanLabel(child.nickname);
  return name !== '' ? name : PARENT_TEXT.childFallback(index + 1);
}
