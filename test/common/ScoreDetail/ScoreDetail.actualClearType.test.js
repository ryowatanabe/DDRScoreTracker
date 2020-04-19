import { ScoreDetail } from '../../../src/static/common/ScoreDetail.js';
import { Constants } from '../../../src/static/common/Constants.js';

test('ScoreDetail.actualClearType (empty)', () => {
  const scoreDetail = ScoreDetail.createFromStorage({
  });
  expect(scoreDetail.actualClearType).toBe(Constants.CLEAR_TYPE.NO_PLAY);
});

test('ScoreDetail.actualClearType (simple noplay)', () => {
  const scoreDetail = ScoreDetail.createFromStorage({
    score: 0,
    scoreRank: Constants.SCORE_RANK.NO_PLAY
  });
  expect(scoreDetail.actualClearType).toBe(Constants.CLEAR_TYPE.NO_PLAY);
});

test('ScoreDetail.actualClearType (simple failed)', () => {
  const scoreDetail = ScoreDetail.createFromStorage({
    score: 900000,
    scoreRank: Constants.SCORE_RANK.E
  });
  expect(scoreDetail.actualClearType).toBe(Constants.CLEAR_TYPE.FAILED);
});

test('ScoreDetail.actualClearType (simple clear)', () => {
  const scoreDetail = ScoreDetail.createFromStorage({
    score: 500000,
    scoreRank: Constants.SCORE_RANK.D
  });
  expect(scoreDetail.actualClearType).toBe(Constants.CLEAR_TYPE.CLEAR);
});

test('ScoreDetail.actualClearType (detail assistClear)', () => {
  const scoreDetail = ScoreDetail.createFromStorage({
    score: 500000,
    scoreRank: Constants.SCORE_RANK.D,
    clearCount: 0,
    playCount: 1,
  });
  expect(scoreDetail.actualClearType).toBe(Constants.CLEAR_TYPE.ASSIST_CLEAR);
});

test('ScoreDetail.actualClearType (detail failed)', () => {
  const scoreDetail = ScoreDetail.createFromStorage({
    score: 900000,
    scoreRank: Constants.SCORE_RANK.E,
    clearCount: 0,
    playCount: 1,
  });
  expect(scoreDetail.actualClearType).toBe(Constants.CLEAR_TYPE.FAILED);
});

test('ScoreDetail.actualClearType (detail clear)', () => {
  const scoreDetail = ScoreDetail.createFromStorage({
    score: 900000,
    scoreRank: Constants.SCORE_RANK.E,
    clearCount: 1,
    playCount: 2,
  });
  expect(scoreDetail.actualClearType).toBe(Constants.CLEAR_TYPE.CLEAR);
});

test('ScoreDetail.actualClearType (manual input life4)', () => {
  const scoreDetail = ScoreDetail.createFromStorage({
    score: 900000,
    scoreRank: Constants.SCORE_RANK.E,
    clearType: Constants.CLEAR_TYPE.LIFE4
  });
  expect(scoreDetail.actualClearType).toBe(Constants.CLEAR_TYPE.LIFE4);
});
