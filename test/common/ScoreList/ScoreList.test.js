import { ScoreList } from '../../../src/static/common/ScoreList.js';
import { ScoreData } from '../../../src/static/common/ScoreData.js';
import { ScoreDetail } from '../../../src/static/common/ScoreDetail.js';
import { Constants } from '../../../src/static/common/Constants.js';

function makeScoreData(musicId, difficultyValue, score) {
  const scoreData = new ScoreData(musicId);
  scoreData.musicType = Constants.MUSIC_TYPE.NORMAL;
  const detail = ScoreDetail.createFromStorage({ score });
  scoreData.applyScoreDetail(difficultyValue, detail);
  return scoreData;
}

test('ScoreList starts empty', () => {
  const scoreList = new ScoreList();
  expect(scoreList.musicIds).toHaveLength(0);
});

test('ScoreList.hasMusic returns false for missing musicId', () => {
  const scoreList = new ScoreList();
  expect(scoreList.hasMusic('music001')).toBe(false);
});

test('ScoreList.applyScoreData adds new ScoreData and returns diffs', () => {
  const scoreList = new ScoreList();
  const scoreData = makeScoreData('music001', 3, 900000);
  const diffs = scoreList.applyScoreData(scoreData);
  expect(scoreList.hasMusic('music001')).toBe(true);
  expect(diffs).toHaveLength(1);
});

test('ScoreList.applyScoreData merges existing ScoreData', () => {
  const scoreList = new ScoreList();
  const scoreData1 = makeScoreData('music001', 3, 900000);
  scoreList.applyScoreData(scoreData1);
  const scoreData2 = makeScoreData('music001', 3, 950000);
  const diffs = scoreList.applyScoreData(scoreData2);
  expect(scoreList.getScoreDataByMusicId('music001').getScoreDetailByDifficulty(3).score).toBe(950000);
  expect(diffs.length).toBeGreaterThan(0);
});

test('ScoreList.applyObject adds new ScoreData via storage object', () => {
  const scoreList = new ScoreList();
  const object = {
    musicId: 'music001',
    musicType: Constants.MUSIC_TYPE.NORMAL,
    difficulty: {
      3: { score: 900000 },
    },
  };
  const diffs = scoreList.applyObject(object);
  expect(scoreList.hasMusic('music001')).toBe(true);
  expect(diffs).toHaveLength(1);
});

test('ScoreList.getScoreDataByMusicId returns correct ScoreData', () => {
  const scoreList = new ScoreList();
  const scoreData = makeScoreData('music001', 3, 900000);
  scoreList.applyScoreData(scoreData);
  const retrieved = scoreList.getScoreDataByMusicId('music001');
  expect(retrieved.musicId).toBe('music001');
});

test('ScoreList.musicIds returns all music IDs', () => {
  const scoreList = new ScoreList();
  scoreList.applyScoreData(makeScoreData('music001', 3, 900000));
  scoreList.applyScoreData(makeScoreData('music002', 3, 800000));
  expect(scoreList.musicIds).toContain('music001');
  expect(scoreList.musicIds).toContain('music002');
  expect(scoreList.musicIds).toHaveLength(2);
});

test('ScoreList.toStorageData returns musics object', () => {
  const scoreList = new ScoreList();
  scoreList.applyScoreData(makeScoreData('music001', 3, 900000));
  const storageData = scoreList.toStorageData();
  expect(Object.prototype.hasOwnProperty.call(storageData, 'music001')).toBe(true);
});

test('ScoreList.createFromStorage restores from storage data', () => {
  const storageData = {
    music001: {
      musicId: 'music001',
      musicType: Constants.MUSIC_TYPE.NORMAL,
      difficulty: {
        3: { score: 900000 },
      },
    },
  };
  const scoreList = ScoreList.createFromStorage(storageData);
  expect(scoreList.hasMusic('music001')).toBe(true);
  expect(scoreList.getScoreDataByMusicId('music001').getScoreDetailByDifficulty(3).score).toBe(900000);
});
