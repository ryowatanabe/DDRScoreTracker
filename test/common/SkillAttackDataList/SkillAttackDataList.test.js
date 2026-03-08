jest.mock('../../../src/static/common/Logger.js', () => ({
  Logger: { info: jest.fn(), debug: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

import { SkillAttackDataList } from '../../../src/static/common/SkillAttackDataList.js';
import { SkillAttackDataElement } from '../../../src/static/common/SkillAttackDataElement.js';
import { SkillAttackIndexMap } from '../../../src/static/common/SkillAttackIndexMap.js';

// line format: index \t playMode \t difficulty \t ? \t updatedAt \t score \t clearType \t ?
const line1 = '1\t0\t3\t0\t1234567890\t900000\t0\t0'; // index=1, SP, ESP, score=900000
const line2 = '2\t0\t2\t0\t1234567890\t850000\t0\t0'; // index=2, SP, DSP, score=850000

test('SkillAttackDataList starts empty', () => {
  const list = new SkillAttackDataList({});
  expect(list.count).toBe(0);
});

test('SkillAttackDataList.applyText parses lines and populates elements', () => {
  const list = new SkillAttackDataList({});
  list.applyText(`${line1}\n${line2}\n`);
  expect(list.count).toBe(2);
});

test('SkillAttackDataList.applyText ignores blank lines', () => {
  const list = new SkillAttackDataList({});
  list.applyText(`\n${line1}\n\n`);
  expect(list.count).toBe(1);
});

test('SkillAttackDataList.hasIndex returns true after applyText', () => {
  const list = new SkillAttackDataList({});
  list.applyText(line1);
  expect(list.hasIndex(1)).toBe(true);
});

test('SkillAttackDataList.hasIndex returns false for missing index', () => {
  const list = new SkillAttackDataList({});
  expect(list.hasIndex(999)).toBe(false);
});

test('SkillAttackDataList.hasElement returns true for existing element', () => {
  const list = new SkillAttackDataList({});
  list.applyText(line1);
  // difficultyValue for playMode=0, difficulty=3 is 3
  expect(list.hasElement(1, 3)).toBe(true);
});

test('SkillAttackDataList.hasElement returns false for missing difficultyValue', () => {
  const list = new SkillAttackDataList({});
  list.applyText(line1);
  expect(list.hasElement(1, 4)).toBe(false);
});

test('SkillAttackDataList.getElement returns element for existing key', () => {
  const list = new SkillAttackDataList({});
  list.applyText(line1);
  const el = list.getElement(1, 3);
  expect(el).not.toBeNull();
  expect(el.score).toBe(900000);
});

test('SkillAttackDataList.getElement returns null for missing element', () => {
  const list = new SkillAttackDataList({});
  expect(list.getElement(999, 3)).toBeNull();
});

test('SkillAttackDataList.applyElement merges when element already exists', () => {
  const list = new SkillAttackDataList({});
  list.applyText(line1);
  // Apply newer element with higher score
  const newer = SkillAttackDataElement.createFromString('1\t0\t3\t0\t9999999999\t950000\t0\t0');
  list.applyElement(newer);
  expect(list.getElement(1, 3).score).toBe(950000);
});

test('SkillAttackDataList.applyElement does nothing with null', () => {
  const list = new SkillAttackDataList({});
  list.applyElement(null);
  expect(list.count).toBe(0);
});

test('SkillAttackDataList.urlSearchParams produces correct params', () => {
  const list = new SkillAttackDataList({});
  list.applyText(line1);
  const params = list.urlSearchParams('1234567890', 'password');
  expect(params.get('_')).toBe('score_submit');
  expect(params.get('password')).toBe('password');
  expect(params.get('ddrcode')).toBe('1234567890');
  // 'index[]' should contain index 1
  expect(params.getAll('index[]')).toContain('1');
});

test('SkillAttackDataList.getDiff returns elements with higher score', () => {
  const indexMapText = '1\tmusic001\n';
  const indexMap = SkillAttackIndexMap.createFromText(indexMapText);

  // Existing SA data: score=800000
  const existingList = new SkillAttackDataList(indexMap);
  existingList.applyText('1\t0\t3\t0\t1234567890\t800000\t0\t0');

  // Create mock musicList and scoreList
  const musicList = {
    hasMusic: () => false,
    getMusicDataById: () => null,
  };
  const scoreList = {
    musicIds: ['music001'],
    getScoreDataByMusicId: () => ({
      difficulties: ['3'],
      getScoreDetailByDifficulty: () => ({ score: 900000, clearType: 0 }),
    }),
  };

  const diff = existingList.getDiff(musicList, scoreList);
  expect(diff.count).toBe(1);
});

test('SkillAttackDataList.getDiff does not include when score is not higher', () => {
  const indexMapText = '1\tmusic001\n';
  const indexMap = SkillAttackIndexMap.createFromText(indexMapText);

  // Existing SA data: score=900000
  const existingList = new SkillAttackDataList(indexMap);
  existingList.applyText('1\t0\t3\t0\t1234567890\t900000\t0\t0');

  const musicList = {
    hasMusic: () => false,
    getMusicDataById: () => null,
  };
  const scoreList = {
    musicIds: ['music001'],
    getScoreDataByMusicId: () => ({
      difficulties: ['3'],
      getScoreDetailByDifficulty: () => ({ score: 900000, clearType: 0 }),
    }),
  };

  const diff = existingList.getDiff(musicList, scoreList);
  expect(diff.count).toBe(0);
});
