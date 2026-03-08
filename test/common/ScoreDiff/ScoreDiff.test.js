import { ScoreDiff } from '../../../src/static/common/ScoreDiff.js';
import { ScoreDetail } from '../../../src/static/common/ScoreDetail.js';
import { ScoreData } from '../../../src/static/common/ScoreData.js';
import { MusicData } from '../../../src/static/common/MusicData.js';
import { Constants } from '../../../src/static/common/Constants.js';

test('ScoreDiff.createFromScoreDetail sets before and after', () => {
  const before = ScoreDetail.createFromStorage({ score: 800000 });
  const after = ScoreDetail.createFromStorage({ score: 900000 });
  const diff = ScoreDiff.createFromScoreDetail(before, after);
  expect(diff.before.score).toBe(800000);
  expect(diff.after.score).toBe(900000);
});

test('ScoreDiff.createFromScoreDetail with null before', () => {
  const after = ScoreDetail.createFromStorage({ score: 900000 });
  const diff = ScoreDiff.createFromScoreDetail(null, after);
  expect(diff.before).toBeNull();
  expect(diff.after.score).toBe(900000);
});

test('ScoreDiff.createFromStorage restores before and after', () => {
  const storageData = {
    musicId: 'music001',
    difficultyValue: 3,
    before: { score: 800000 },
    after: { score: 900000 },
  };
  const diff = ScoreDiff.createFromStorage(storageData);
  expect(diff.musicId).toBe('music001');
  expect(diff.difficultyValue).toBe(3);
  expect(diff.before.score).toBe(800000);
  expect(diff.after.score).toBe(900000);
});

test('ScoreDiff.createFromStorage with null before', () => {
  const storageData = {
    musicId: 'music001',
    difficultyValue: 3,
    before: null,
    after: { score: 900000 },
  };
  const diff = ScoreDiff.createFromStorage(storageData);
  expect(diff.before).toBeNull();
});

test('ScoreDiff.createMultiFromStorage creates multiple diffs', () => {
  const storageData = [
    { musicId: 'music001', difficultyValue: 3, before: null, after: { score: 900000 } },
    { musicId: 'music001', difficultyValue: 4, before: { score: 800000 }, after: { score: 850000 } },
  ];
  const diffs = ScoreDiff.createMultiFromStorage(storageData);
  expect(diffs).toHaveLength(2);
  expect(diffs[0].difficultyValue).toBe(3);
  expect(diffs[1].difficultyValue).toBe(4);
});

test('ScoreDiff.createMultiFromScoreData creates diffs for each difficulty', () => {
  const scoreData = new ScoreData('music001');
  scoreData.applyScoreDetail(3, ScoreDetail.createFromStorage({ score: 900000 }));
  scoreData.applyScoreDetail(4, ScoreDetail.createFromStorage({ score: 850000 }));
  const diffs = ScoreDiff.createMultiFromScoreData(scoreData);
  expect(diffs).toHaveLength(2);
  diffs.forEach((diff) => {
    expect(diff.musicId).toBe('music001');
    expect(diff.before).toBeNull();
  });
});

test('ScoreDiff.title returns musicId when musicData is null', () => {
  const diff = new ScoreDiff();
  diff.musicId = 'music001';
  diff.musicData = null;
  expect(diff.title).toBe('music001');
});

test('ScoreDiff.title returns musicData.title when musicData is set', () => {
  const diff = new ScoreDiff();
  diff.musicId = 'music001';
  diff.musicData = new MusicData('music001', Constants.MUSIC_TYPE.NORMAL, 'Song Title', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  expect(diff.title).toBe('Song Title');
});

test('ScoreDiff.playMode returns correct play mode from difficultyValue', () => {
  const diff = new ScoreDiff();
  diff.difficultyValue = 3; // ESP (SINGLE)
  expect(diff.playMode).toBe(Constants.PLAY_MODE.SINGLE);
  diff.difficultyValue = 7; // EDP (DOUBLE)
  expect(diff.playMode).toBe(Constants.PLAY_MODE.DOUBLE);
});

test('ScoreDiff.difficulty returns correct difficulty from difficultyValue', () => {
  const diff = new ScoreDiff();
  diff.difficultyValue = 3; // ESP
  expect(diff.difficulty).toBe(3);
  diff.difficultyValue = 7; // EDP => difficulty 3
  expect(diff.difficulty).toBe(3);
});

test('ScoreDiff.level returns 0 when musicData is null', () => {
  const diff = new ScoreDiff();
  diff.musicData = null;
  diff.difficultyValue = 3;
  expect(diff.level).toBe(0);
});

test('ScoreDiff.levelString returns "?" when level is 0', () => {
  const diff = new ScoreDiff();
  diff.musicData = null;
  expect(diff.levelString).toBe('?');
});

test('ScoreDiff.levelString returns level as string when level is non-zero', () => {
  const diff = new ScoreDiff();
  diff.difficultyValue = 3;
  diff.musicData = new MusicData('music001', Constants.MUSIC_TYPE.NORMAL, 'Title', [0, 5, 8, 12, 0, 0, 0, 0, 0], 0);
  expect(diff.levelString).toBe('12');
});

test('ScoreDiff before/after getter returns null when before/after is null', () => {
  const diff = new ScoreDiff();
  diff.before = null;
  diff.after = null;
  expect(diff.beforeScore).toBeNull();
  expect(diff.afterScore).toBeNull();
  expect(diff.beforeScoreRank).toBeNull();
  expect(diff.afterScoreRank).toBeNull();
  expect(diff.beforeClearType).toBeNull();
  expect(diff.afterClearType).toBeNull();
});

test('ScoreDiff beforeScoreString returns empty string when beforeScore is null', () => {
  const diff = new ScoreDiff();
  diff.before = null;
  expect(diff.beforeScoreString).toBe('');
});

test('ScoreDiff afterScoreString returns formatted score when set', () => {
  const after = ScoreDetail.createFromStorage({ score: 1000000, scoreRank: Constants.SCORE_RANK.AAA });
  const diff = ScoreDiff.createFromScoreDetail(null, after);
  expect(diff.afterScoreString).toBe((1000000).toLocaleString());
});

test('ScoreDiff.playModeSymbol returns correct symbol', () => {
  const diff = new ScoreDiff();
  diff.difficultyValue = 3; // SINGLE
  expect(diff.playModeSymbol).toBe(Constants.PLAY_MODE_SYMBOL[Constants.PLAY_MODE.SINGLE]);
  diff.difficultyValue = 7; // DOUBLE
  expect(diff.playModeSymbol).toBe(Constants.PLAY_MODE_SYMBOL[Constants.PLAY_MODE.DOUBLE]);
});

test('ScoreDiff.difficultyClassString returns correct class string', () => {
  const diff = new ScoreDiff();
  diff.difficultyValue = 3; // ESP
  expect(diff.difficultyClassString).toBe(Constants.DIFFICULTY_CLASS_STRING[3]);
});

test('ScoreDiff.beforeClearTypeString and afterClearTypeString return empty when null', () => {
  const diff = new ScoreDiff();
  diff.before = null;
  diff.after = null;
  expect(diff.beforeClearTypeString).toBe('');
  expect(diff.afterClearTypeString).toBe('');
});
