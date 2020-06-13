import { ChartList } from '../../../src/static/common/ChartList.js';
import { Constants } from '../../../src/static/common/Constants.js';

test('ChartList.scoreToScoreRank (AAA)', () => {
  const chartList = new ChartList();
  expect(chartList.scoreToScoreRank(990000)).toBe(Constants.SCORE_RANK.AAA);
});
