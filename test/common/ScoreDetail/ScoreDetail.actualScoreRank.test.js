import { ScoreDetail } from '../../../src/static/common/ScoreDetail.js';
import { Constants } from '../../../src/static/common/Constants.js';

test('ScoreDetail.actualScoreRank returns NO_PLAY when scoreRank is null', () => {
  const scoreDetail = ScoreDetail.createFromStorage({});
  expect(scoreDetail.actualScoreRank).toBe(Constants.SCORE_RANK.NO_PLAY);
});

test('ScoreDetail.actualScoreRank returns the stored scoreRank when set', () => {
  const scoreDetail = ScoreDetail.createFromStorage({ scoreRank: Constants.SCORE_RANK.AAA });
  expect(scoreDetail.actualScoreRank).toBe(Constants.SCORE_RANK.AAA);
});

test('ScoreDetail.actualScoreRank returns E rank when set', () => {
  const scoreDetail = ScoreDetail.createFromStorage({ scoreRank: Constants.SCORE_RANK.E });
  expect(scoreDetail.actualScoreRank).toBe(Constants.SCORE_RANK.E);
});
