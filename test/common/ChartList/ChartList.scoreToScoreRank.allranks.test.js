import { ChartList } from '../../../src/static/common/ChartList.js';
import { Constants } from '../../../src/static/common/Constants.js';

describe('ChartList.scoreToScoreRank', () => {
  let chartList;
  beforeEach(() => {
    chartList = new ChartList();
  });

  test('990000 → AAA', () => {
    expect(chartList.scoreToScoreRank(990000)).toBe(Constants.SCORE_RANK.AAA);
  });

  test('1000000 → AAA', () => {
    expect(chartList.scoreToScoreRank(1000000)).toBe(Constants.SCORE_RANK.AAA);
  });

  test('950000 → AA+', () => {
    expect(chartList.scoreToScoreRank(950000)).toBe(Constants.SCORE_RANK.AA_PLUS);
  });

  test('960000 → AA+', () => {
    expect(chartList.scoreToScoreRank(960000)).toBe(Constants.SCORE_RANK.AA_PLUS);
  });

  test('900000 → AA', () => {
    expect(chartList.scoreToScoreRank(900000)).toBe(Constants.SCORE_RANK.AA);
  });

  test('910000 → AA', () => {
    expect(chartList.scoreToScoreRank(910000)).toBe(Constants.SCORE_RANK.AA);
  });

  test('890000 → AA-', () => {
    expect(chartList.scoreToScoreRank(890000)).toBe(Constants.SCORE_RANK.AA_MINUS);
  });

  test('850000 → A+', () => {
    expect(chartList.scoreToScoreRank(850000)).toBe(Constants.SCORE_RANK.A_PLUS);
  });

  test('800000 → A', () => {
    expect(chartList.scoreToScoreRank(800000)).toBe(Constants.SCORE_RANK.A);
  });

  test('790000 → A-', () => {
    expect(chartList.scoreToScoreRank(790000)).toBe(Constants.SCORE_RANK.A_MINUS);
  });

  test('750000 → B+', () => {
    expect(chartList.scoreToScoreRank(750000)).toBe(Constants.SCORE_RANK.B_PLUS);
  });

  test('700000 → B', () => {
    expect(chartList.scoreToScoreRank(700000)).toBe(Constants.SCORE_RANK.B);
  });

  test('690000 → B-', () => {
    expect(chartList.scoreToScoreRank(690000)).toBe(Constants.SCORE_RANK.B_MINUS);
  });

  test('650000 → C+', () => {
    expect(chartList.scoreToScoreRank(650000)).toBe(Constants.SCORE_RANK.C_PLUS);
  });

  test('600000 → C', () => {
    expect(chartList.scoreToScoreRank(600000)).toBe(Constants.SCORE_RANK.C);
  });

  test('590000 → C-', () => {
    expect(chartList.scoreToScoreRank(590000)).toBe(Constants.SCORE_RANK.C_MINUS);
  });

  test('550000 → D+', () => {
    expect(chartList.scoreToScoreRank(550000)).toBe(Constants.SCORE_RANK.D_PLUS);
  });

  test('0 → D', () => {
    expect(chartList.scoreToScoreRank(0)).toBe(Constants.SCORE_RANK.D);
  });

  test('300000 → D', () => {
    expect(chartList.scoreToScoreRank(300000)).toBe(Constants.SCORE_RANK.D);
  });
});
