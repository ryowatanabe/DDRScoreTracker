import { ScoreDetail } from '../../../src/static/common/ScoreDetail.js';

test('ScoreDetail.clone creates an independent copy', () => {
  const original = ScoreDetail.createFromStorage({
    score: 900000,
    scoreRank: 14,
    clearType: 3,
    playCount: 5,
    clearCount: 3,
    maxCombo: 100,
  });
  const cloned = original.clone();
  expect(cloned).toStrictEqual(original);
  // Mutate the clone and verify the original is unaffected
  cloned.score = 0;
  expect(original.score).toBe(900000);
});

test('ScoreDetail.clone copies null values correctly', () => {
  const original = ScoreDetail.createFromStorage({});
  const cloned = original.clone();
  expect(cloned.score).toBeNull();
  expect(cloned.scoreRank).toBeNull();
  expect(cloned.clearType).toBeNull();
});
