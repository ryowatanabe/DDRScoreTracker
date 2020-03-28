import { ScoreDetail } from '../../common/ScoreDetail.js';
import { Constants } from '../../common/Constants.js';

test('test1', () => {
  const scoreDetail = ScoreDetail.createFromStorage({
  });
  expect(scoreDetail.actualClearType).toBe(Constants.CLEAR_TYPE.NO_PLAY);
});
