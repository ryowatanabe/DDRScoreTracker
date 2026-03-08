import { ChartList } from '../../../src/static/common/ChartList.js';
import { ChartData } from '../../../src/static/common/ChartData.js';
import { Constants } from '../../../src/static/common/Constants.js';

function makeChart(score, clearType) {
  const chart = new ChartData('music001', Constants.PLAY_MODE.SINGLE, Constants.DIFFICULTIES.EXPERT);
  chart._score = score;
  chart._clearType = clearType;
  // Override getters via scoreDetail-like object
  Object.defineProperty(chart, 'score', { get: () => score });
  Object.defineProperty(chart, 'clearType', { get: () => clearType });
  return chart;
}

test('ChartList.compareChartData returns 0 when no sort conditions', () => {
  const a = makeChart(900000, 3);
  const b = makeChart(800000, 3);
  expect(ChartList.compareChartData(a, b, [])).toBe(0);
});

test('ChartList.compareChartData asc: lower value comes first', () => {
  const a = makeChart(800000, 3);
  const b = makeChart(900000, 3);
  const result = ChartList.compareChartData(a, b, [{ attribute: 'score', order: 'asc' }]);
  expect(result).toBeLessThan(0);
});

test('ChartList.compareChartData desc: higher value comes first', () => {
  const a = makeChart(900000, 3);
  const b = makeChart(800000, 3);
  const result = ChartList.compareChartData(a, b, [{ attribute: 'score', order: 'desc' }]);
  expect(result).toBeLessThan(0);
});

test('ChartList.compareChartData falls through to next condition when equal', () => {
  const a = makeChart(900000, 5);
  const b = makeChart(900000, 3);
  const result = ChartList.compareChartData(a, b, [
    { attribute: 'score', order: 'desc' },
    { attribute: 'clearType', order: 'desc' },
  ]);
  expect(result).toBeLessThan(0); // a has higher clearType, so a comes first in desc
});

test('ChartList.compareChartData null value sorts to end in asc', () => {
  const a = { score: null };
  const b = { score: 900000 };
  const result = ChartList.compareChartData(a, b, [{ attribute: 'score', order: 'asc' }]);
  expect(result).toBeLessThan(0); // null treated as less
});
