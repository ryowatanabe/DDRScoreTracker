import { ScoreData } from '../../../src/static/common/ScoreData.js';
import { ScoreDetail } from '../../../src/static/common/ScoreDetail.js';
import { Constants } from '../../../src/static/common/Constants.js';

test('ScoreData.createFromStorage creates instance with musicId and musicType', () => {
  const storageData = {
    musicId: 'music001',
    musicType: Constants.MUSIC_TYPE.NORMAL,
    difficulty: {},
  };
  const scoreData = ScoreData.createFromStorage(storageData);
  expect(scoreData.musicId).toBe('music001');
  expect(scoreData.musicType).toBe(Constants.MUSIC_TYPE.NORMAL);
});

test('ScoreData.createFromStorage defaults musicType to UNKNOWN when not set', () => {
  const storageData = {
    musicId: 'music001',
    difficulty: {},
  };
  const scoreData = ScoreData.createFromStorage(storageData);
  expect(scoreData.musicType).toBe(Constants.MUSIC_TYPE.UNKNOWN);
});

test('ScoreData.createFromStorage restores ScoreDetail per difficulty', () => {
  const storageData = {
    musicId: 'music001',
    difficulty: {
      3: { score: 900000, scoreRank: 14 },
    },
  };
  const scoreData = ScoreData.createFromStorage(storageData);
  expect(scoreData.hasDifficulty(3)).toBe(true);
  expect(scoreData.getScoreDetailByDifficulty(3).score).toBe(900000);
});

test('ScoreData.hasDifficulty returns false for non-existing difficulty', () => {
  const scoreData = new ScoreData('music001');
  expect(scoreData.hasDifficulty(3)).toBe(false);
});

test('ScoreData.difficulties returns list of difficulty values', () => {
  const scoreData = new ScoreData('music001');
  const detail = ScoreDetail.createFromStorage({ score: 900000 });
  scoreData.applyScoreDetail(3, detail);
  scoreData.applyScoreDetail(4, detail);
  expect(scoreData.difficulties).toContain('3');
  expect(scoreData.difficulties).toContain('4');
  expect(scoreData.difficulties).toHaveLength(2);
});

test('ScoreData.applyScoreDetail adds new difficulty with diff', () => {
  const scoreData = new ScoreData('music001');
  const detail = ScoreDetail.createFromStorage({ score: 900000 });
  const diff = scoreData.applyScoreDetail(3, detail);
  expect(diff).not.toBeNull();
  expect(scoreData.hasDifficulty(3)).toBe(true);
  expect(diff.after.score).toBe(900000);
  expect(diff.before).toBeNull();
});

test('ScoreData.applyScoreDetail merges existing difficulty', () => {
  const scoreData = new ScoreData('music001');
  const detail1 = ScoreDetail.createFromStorage({ score: 900000 });
  scoreData.applyScoreDetail(3, detail1);
  const detail2 = ScoreDetail.createFromStorage({ score: 950000 });
  const diff = scoreData.applyScoreDetail(3, detail2);
  // merge should update score
  expect(scoreData.getScoreDetailByDifficulty(3).score).toBe(950000);
  expect(diff).not.toBeNull();
});

test('ScoreData.applyScoreDetail returns null when no change', () => {
  const scoreData = new ScoreData('music001');
  const detail = ScoreDetail.createFromStorage({ score: 900000 });
  scoreData.applyScoreDetail(3, detail);
  const sameDetail = ScoreDetail.createFromStorage({ score: 900000 });
  const diff = scoreData.applyScoreDetail(3, sameDetail);
  expect(diff).toBeNull();
});

test('ScoreData.merge applies all difficulties from another ScoreData', () => {
  const base = new ScoreData('music001');
  const detail1 = ScoreDetail.createFromStorage({ score: 800000 });
  base.applyScoreDetail(3, detail1);

  const other = new ScoreData('music001');
  other.musicType = Constants.MUSIC_TYPE.NORMAL;
  const detail2 = ScoreDetail.createFromStorage({ score: 900000 });
  other.applyScoreDetail(3, detail2);
  other.applyScoreDetail(4, ScoreDetail.createFromStorage({ score: 850000 }));

  const diffs = base.merge(other);
  expect(base.musicType).toBe(Constants.MUSIC_TYPE.NORMAL);
  expect(base.getScoreDetailByDifficulty(3).score).toBe(900000);
  expect(base.hasDifficulty(4)).toBe(true);
  expect(diffs.length).toBeGreaterThan(0);
});

test('ScoreData.merge does not update musicType when UNKNOWN', () => {
  const base = new ScoreData('music001');
  base.musicType = Constants.MUSIC_TYPE.NORMAL;
  const other = new ScoreData('music001');
  // other.musicType defaults to UNKNOWN
  base.merge(other);
  expect(base.musicType).toBe(Constants.MUSIC_TYPE.NORMAL);
});
