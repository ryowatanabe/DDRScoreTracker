import { ChartList } from '../../../src/static/common/ChartList.js';
import { ChartData } from '../../../src/static/common/ChartData.js';
import { ScoreDetail } from '../../../src/static/common/ScoreDetail.js';
import { Constants } from '../../../src/static/common/Constants.js';

function makeChartData(musicId, playMode, difficulty, score, clearType, scoreRank) {
  const chartData = new ChartData(musicId, playMode, difficulty);
  if (score !== null) {
    const detail = new ScoreDetail();
    detail.score = score;
    detail.clearType = clearType;
    detail.scoreRank = scoreRank;
    detail.flareRank = Constants.FLARE_RANK.NONE;
    chartData.scoreDetail = detail;
  }
  return chartData;
}

test('ChartList.reset clears charts and statistics', () => {
  const chartList = new ChartList();
  chartList.addChartData(makeChartData('m1', 0, 3, 900000, 3, 14));
  chartList.reset();
  expect(chartList.charts).toHaveLength(0);
  expect(chartList.statistics).toStrictEqual({});
});

test('ChartList.addChartData adds chart to list', () => {
  const chartList = new ChartList();
  chartList.addChartData(makeChartData('m1', 0, 3, 900000, 3, 14));
  expect(chartList.charts).toHaveLength(1);
});

test('ChartList.getFilteredAndSorted returns all charts when no filter', () => {
  const chartList = new ChartList();
  chartList.addChartData(makeChartData('m1', 0, 3, 900000, Constants.CLEAR_TYPE.CLEAR, Constants.SCORE_RANK.AA));
  chartList.addChartData(makeChartData('m2', 0, 3, 800000, Constants.CLEAR_TYPE.CLEAR, Constants.SCORE_RANK.A));

  const allClearTypes = Object.values(Constants.CLEAR_TYPE);
  const allPlayModes = Object.values(Constants.PLAY_MODE);
  const filtered = chartList.getFilteredAndSorted([{ attribute: 'playMode', values: allPlayModes }], []);
  expect(filtered.charts).toHaveLength(2);
});

test('ChartList.getFilteredAndSorted filters by playMode', () => {
  const chartList = new ChartList();
  chartList.addChartData(makeChartData('m1', Constants.PLAY_MODE.SINGLE, 3, 900000, Constants.CLEAR_TYPE.CLEAR, Constants.SCORE_RANK.AA));
  chartList.addChartData(makeChartData('m2', Constants.PLAY_MODE.DOUBLE, 3, 800000, Constants.CLEAR_TYPE.CLEAR, Constants.SCORE_RANK.A));

  const filtered = chartList.getFilteredAndSorted([{ attribute: 'playMode', values: [Constants.PLAY_MODE.SINGLE] }], []);
  expect(filtered.charts).toHaveLength(1);
  expect(filtered.charts[0].playMode).toBe(Constants.PLAY_MODE.SINGLE);
});

test('ChartList.getFilteredAndSorted sorts by score desc', () => {
  const chartList = new ChartList();
  chartList.addChartData(makeChartData('m1', 0, 3, 800000, Constants.CLEAR_TYPE.CLEAR, Constants.SCORE_RANK.A));
  chartList.addChartData(makeChartData('m2', 0, 3, 900000, Constants.CLEAR_TYPE.CLEAR, Constants.SCORE_RANK.AA));

  const allPlayModes = Object.values(Constants.PLAY_MODE);
  const filtered = chartList.getFilteredAndSorted([{ attribute: 'playMode', values: allPlayModes }], [{ attribute: 'score', order: 'desc' }]);
  expect(filtered.charts[0].score).toBe(900000);
  expect(filtered.charts[1].score).toBe(800000);
});

test('ChartList.getFilteredAndSorted updates statistics', () => {
  const chartList = new ChartList();
  chartList.addChartData(makeChartData('m1', 0, 3, 900000, Constants.CLEAR_TYPE.CLEAR, Constants.SCORE_RANK.AA));

  const allPlayModes = Object.values(Constants.PLAY_MODE);
  const filtered = chartList.getFilteredAndSorted([{ attribute: 'playMode', values: allPlayModes }], []);
  expect(filtered.statistics.score).not.toStrictEqual({});
  expect(filtered.statistics.score.max.value).toBe(900000);
});

test('ChartList.updateStatistics with empty charts leaves score empty', () => {
  const chartList = new ChartList();
  chartList.updateStatistics();
  expect(chartList.statistics.score).toStrictEqual({});
});

test('ChartList.updateStatistics counts clearTypes', () => {
  const chartList = new ChartList();
  chartList.addChartData(makeChartData('m1', 0, 3, 900000, Constants.CLEAR_TYPE.CLEAR, Constants.SCORE_RANK.AA));
  chartList.addChartData(makeChartData('m2', 0, 3, 800000, Constants.CLEAR_TYPE.FAILED, Constants.SCORE_RANK.E));
  chartList.updateStatistics();
  const clearStat = chartList.statistics.clearType.find((s) => s.clearType === Constants.CLEAR_TYPE.CLEAR);
  const failedStat = chartList.statistics.clearType.find((s) => s.clearType === Constants.CLEAR_TYPE.FAILED);
  expect(clearStat.count).toBe(1);
  expect(failedStat.count).toBe(1);
});
