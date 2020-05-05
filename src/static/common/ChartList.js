import { ChartData } from './ChartData.js';
import { Constants } from './Constants.js';
import { Statistics } from './Statistics.js';

export class ChartList {
  charts = [];
  statistics = {};

  constructor() {}

  reset() {
    this.charts = [];
    this.statistics = {};
  }

  addChartData(chartData) {
    this.charts.push(chartData);
  }

  updateStatistics() {
    const statistics = {
      clearType: [],
      scoreRank: [],
      score: {},
    };
    /* clearType */
    Object.values(Constants.CLEAR_TYPE).forEach((clearType) => {
      statistics.clearType.push({
        clearType: clearType,
        clearTypeString: Constants.CLEAR_TYPE_STRING[clearType],
        clearTypeClassString: Constants.CLEAR_TYPE_CLASS_STRING[clearType],
        count: this.charts.filter((chartData) => {
          return chartData.clearType == clearType;
        }).length,
      });
    });
    statistics.clearType.sort(function (a, b) {
      return b.clearType - a.clearType;
    });
    /* scoreRank */
    Object.values(Constants.SCORE_RANK).forEach((scoreRank) => {
      statistics.scoreRank.push({
        scoreRank: scoreRank,
        scoreRankString: Constants.SCORE_RANK_STRING[scoreRank],
        scoreRankClassString: Constants.SCORE_RANK_CLASS_STRING[scoreRank],
        count: this.charts.filter((chartData) => {
          return chartData.scoreRank == scoreRank;
        }).length,
      });
    });
    statistics.scoreRank.sort(function (a, b) {
      return b.scoreRank - a.scoreRank;
    });
    /* score */
    if (this.charts.length > 0) {
      const values = this.charts.map((chart) => {
        return chart.score ? chart.score : 0;
      });
      statistics.max = Statistics.max(values);
      statistics.min = Statistics.min(values);
      statistics.average = Statistics.average(values);
      statistics.median = Statistics.median(values);
    }
    this.statistics = statistics;
  }

  /*
  filterCondition = [
    { attribute: "attributeName1", values: [ value11, value12, ...] },
    { attribute: "attributeName2", values: [ value21, value22, ...] },
    ...
  ];

  above example stands for ...

  WHERE attributeName1 IN (value11, value22, ...) AND
        attributeName2 IN (value21, value22, ...) AND ...

  sortCondition = [
    { attribute: "attributeName1", order: "asc OR desc" },
    { attribute: "attributeName2", order: "asc OR desc" },
    ...
  ]
  */
  getFilteredAndSorted(filterConditions, sortConditions) {
    /* filter */
    const chartList = new ChartList();
    this.charts.forEach(function (chartData) {
      let isMatched = true;
      filterConditions.forEach((condition) => {
        if (!condition.values.includes(chartData[condition.attribute])) {
          isMatched = false;
        }
      });
      if (isMatched) {
        chartList.addChartData(chartData);
      }
    });
    /* update statistics */
    chartList.updateStatistics();
    /* sort */
    chartList.charts.sort(function (a, b) {
      return ChartList.compareChartData(a, b, sortConditions);
    });
    return chartList;
  }

  static compareChartData(a, b, sortConditions) {
    if (sortConditions.length == 0) {
      return 0;
    }
    const attribute = sortConditions[0].attribute;
    let lt = -1;
    let gt = 1;
    if (sortConditions[0].order == 'desc') {
      lt = 1;
      gt = -1;
    }
    if (a[attribute] === b[attribute]) {
      return this.compareChartData(a, b, sortConditions.slice(1));
    }
    if (a[attribute] < b[attribute] || a[attribute] === null) {
      return lt;
    }
    return gt;
  }
}
