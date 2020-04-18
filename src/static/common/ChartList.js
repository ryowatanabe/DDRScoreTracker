import { ChartData } from './ChartData.js';
import { Constants } from './Constants.js';

export class ChartList {
  charts = [];

  constructor() {}

  reset() {
    this.charts = [];
  }

  addChartData(chartData) {
    this.charts.push(chartData);
  }

  get statistics() {
    const statistics = {
      clearType: [],
    };
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
      if (a.clearType > b.clearType) {
        return -1;
      } else if (a.clearType < b.clearType) {
        return 1;
      }
      return 0;
    });
    return statistics;
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
