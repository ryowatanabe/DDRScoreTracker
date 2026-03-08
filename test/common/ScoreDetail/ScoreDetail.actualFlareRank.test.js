import { ScoreDetail } from '../../../src/static/common/ScoreDetail.js';
import { Constants } from '../../../src/static/common/Constants.js';

test('ScoreDetail.actualFlareRank returns NONE when flareRank is null', () => {
  const scoreDetail = ScoreDetail.createFromStorage({});
  expect(scoreDetail.actualFlareRank).toBe(Constants.FLARE_RANK.NONE);
});

test('ScoreDetail.actualFlareRank returns the stored flareRank when set', () => {
  const scoreDetail = ScoreDetail.createFromStorage({ flareRank: Constants.FLARE_RANK.FLARE_EX });
  expect(scoreDetail.actualFlareRank).toBe(Constants.FLARE_RANK.FLARE_EX);
});

test('ScoreDetail.actualFlareRank returns FLARE_5 when set', () => {
  const scoreDetail = ScoreDetail.createFromStorage({ flareRank: Constants.FLARE_RANK.FLARE_5 });
  expect(scoreDetail.actualFlareRank).toBe(Constants.FLARE_RANK.FLARE_5);
});
