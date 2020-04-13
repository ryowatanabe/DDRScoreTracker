import { ScoreDetail } from '../../../extension/common/ScoreDetail.js';

test('ScoreDetail.createFromStorage', () => {
  const scoreDetail = ScoreDetail.createFromStorage({
    score: 500000
  });
  expect(scoreDetail.score).toBe(500000);
  expect(scoreDetail.scoreRank).toStrictEqual(null);
  expect(scoreDetail.clearType).toStrictEqual(null);
  expect(scoreDetail.playCount).toStrictEqual(null);
  expect(scoreDetail.clearCount).toStrictEqual(null);
  expect(scoreDetail.maxCombo).toStrictEqual(null);
});

test('ScoreDetail.createFromStorage (convert undef into null)', () => {
  const scoreDetail = ScoreDetail.createFromStorage({
    score: undefined
  });
  expect(scoreDetail.score).toStrictEqual(null);
});
