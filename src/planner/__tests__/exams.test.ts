import { describe, expect, test } from '@jest/globals';
import { examGradeForChild, subjectLabelForChild, subjectLabelForParent } from '@/strings/subjects';
import { createDefaultSettings } from '../defaults';
import { addExam, removeExam, toggleRestDay, upcomingExams } from '../exams';

describe('試験日', () => {
  test('追加すると、その教科がオンになり、日付順に並ぶ', () => {
    let s = createDefaultSettings();
    expect(s.subjects.find((x) => x.id === 'kanken')?.enabled).toBe(false);
    s = addExam(s, { subjectId: 'kanken', date: '2027-02-20', grade: ' 5級 ' });
    s = addExam(s, { subjectId: 'eiken', date: '2027-01-10', grade: '4級' });
    expect(s.subjects.find((x) => x.id === 'kanken')?.enabled).toBe(true);
    expect(s.exams.map((e) => e.date)).toEqual(['2027-01-10', '2027-02-20']);
    expect(s.exams[1].grade).toBe('5級');
  });

  test('同じ試験は二重に追加しない。削除できる', () => {
    const exam = { subjectId: 'kanken', date: '2027-02-20', grade: '5級' };
    let s = addExam(createDefaultSettings(), exam);
    s = addExam(s, exam);
    expect(s.exams).toHaveLength(1);
    expect(removeExam(s, exam).exams).toEqual([]);
  });

  test('今日以降の試験だけを返す（当日はふくむ）', () => {
    const exams = [
      { subjectId: 'kanken', date: '2027-02-20', grade: '5級' },
      { subjectId: 'eiken', date: '2027-01-10', grade: '4級' },
    ];
    expect(upcomingExams(exams, '2027-01-10').map((e) => e.subjectId)).toEqual(['eiken', 'kanken']);
    expect(upcomingExams(exams, '2027-01-11').map((e) => e.subjectId)).toEqual(['kanken']);
  });
});

describe('お休みの日', () => {
  test('タップで入れたり外したりできる', () => {
    let s = createDefaultSettings();
    s = toggleRestDay(s, '2027-02-10');
    s = toggleRestDay(s, '2027-02-03');
    expect(s.restDays).toEqual(['2027-02-03', '2027-02-10']);
    s = toggleRestDay(s, '2027-02-10');
    expect(s.restDays).toEqual(['2027-02-03']);
  });
});

describe('学年による教科名', () => {
  const sansu = { id: 'sansu', kind: 'core' as const, enabled: true };
  const eigo = { id: 'eigo', kind: 'core' as const, enabled: true };
  const custom = { id: 'custom-1', kind: 'custom' as const, enabled: true, label: 'どくしょ' };

  test('学年が未設定・低学年ならひらがな、学年が上がると漢字', () => {
    expect(subjectLabelForChild(sansu)).toBe('さんすう');
    expect(subjectLabelForChild(sansu, 2)).toBe('さんすう');
    expect(subjectLabelForChild(sansu, 3)).toBe('算数');
    expect(subjectLabelForChild(eigo, 4)).toBe('えいご');
    expect(subjectLabelForChild(eigo, 5)).toBe('英語');
    expect(subjectLabelForChild(custom, 6)).toBe('どくしょ');
  });

  test('保護者画面は漢字', () => {
    expect(subjectLabelForParent({ id: 'kanken', kind: 'exam', enabled: true })).toBe('漢検対策');
  });

  test('級はひらがなにする', () => {
    expect(examGradeForChild('準2級')).toBe('じゅん2きゅう');
  });
});
