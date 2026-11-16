import { describe, expect, test } from '@jest/globals';
import { DEFAULT_SUBJECTS } from '../defaults';
import { setSubjectNote } from '../subjects';

describe('setSubjectNote', () => {
  test('一言を付けて、空にすると消える', () => {
    const withNote = setSubjectNote(DEFAULT_SUBJECTS, 'sansu', ' ドリル1ページ ');
    expect(withNote[0]).toEqual({ id: 'sansu', kind: 'core', enabled: true, note: 'ドリル1ページ' });
    expect(withNote[1]).toEqual(DEFAULT_SUBJECTS[1]);
    expect(setSubjectNote(withNote, 'sansu', '  ')[0]).toEqual(DEFAULT_SUBJECTS[0]);
  });
});
