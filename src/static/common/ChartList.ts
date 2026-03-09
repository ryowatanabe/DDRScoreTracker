import { Constants, type ScoreRank } from './Constants.js';
import { Statistics } from './Statistics.js';
import type { ChartData } from './ChartData.js';

type FilterCondition = {
  attribute: string;
  values: unknown[];
};

type SortCondition = {
  attribute: string;
  order: 'asc' | 'desc';
};

type ScoreStatEntry = {
  label: string;
  value: number;
  string?: string;
  scoreRank?: ScoreRank;
  scoreRankString?: string;
  scoreRankClassString?: string;
};

type Statistics_ = {
  clearType: { clearType: number; clearTypeString: string; clearTypeClassString: string; count: number }[];
  flareRank: { flareRank: number; flareRankString: string; flareRankClassString: string; count: number }[];
  scoreRank: { scoreRank: number; scoreRankString: string; scoreRankClassString: string; count: number }[];
  score: Record<string, ScoreStatEntry> & { order?: string[] };
};

export class ChartList {
  charts: ChartData[];
  statistics: Partial<Statistics_>;

  constructor() {
    this.charts = [];
    this.statistics = {};
  }

  reset(): void {
    this.charts = [];
    this.statistics = {};
  }

  addChartData(chartData: ChartData): void {
    this.charts.push(chartData);
  }

  updateStatistics(): void {
    const statistics: Statistics_ = {
      clearType: [],
      flareRank: [],
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
          return chartData.clearType === clearType;
        }).length,
      });
    });
    statistics.clearType.sort(function (a, b) {
      return b.clearType - a.clearType;
    });
    /* flareRank */
    Object.values(Constants.FLARE_RANK).forEach((flareRank) => {
      statistics.flareRank.push({
        flareRank: flareRank,
        flareRankString: Constants.FLARE_RANK_STRING[flareRank],
        flareRankClassString: Constants.FLARE_RANK_CLASS_STRING[flareRank],
        count: this.charts.filter((chartData) => {
          return chartData.flareRank === flareRank;
        }).length,
      });
    });
    statistics.flareRank.sort(function (a, b) {
      return b.flareRank - a.flareRank;
    });
    /* scoreRank */
    Object.values(Constants.SCORE_RANK).forEach((scoreRank) => {
      statistics.scoreRank.push({
        scoreRank: scoreRank,
        scoreRankString: Constants.SCORE_RANK_STRING[scoreRank],
        scoreRankClassString: Constants.SCORE_RANK_CLASS_STRING[scoreRank],
        count: this.charts.filter((chartData) => {
          return chartData.scoreRank === scoreRank;
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
      const attributeNames = ['max', 'min', 'average', 'median'];
      statistics.score = {
        max: { label: 'scoreMax', value: Statistics.max(values) as number },
        min: { label: 'scoreMin', value: Statistics.min(values) as number },
        average: { label: 'scoreAverage', value: Math.round(Statistics.average(values) as number) },
        median: { label: 'scoreMedian', value: Statistics.median(values) as number },
      };
      attributeNames.forEach((attributeName) => {
        statistics.score[attributeName].string = statistics.score[attributeName].value.toLocaleString();
        const scoreRank = this.scoreToScoreRank(statistics.score[attributeName].value);
        statistics.score[attributeName].scoreRank = scoreRank;
        statistics.score[attributeName].scoreRankString = Constants.SCORE_RANK_STRING[scoreRank];
        statistics.score[attributeName].scoreRankClassString = Constants.SCORE_RANK_CLASS_STRING[scoreRank];
      });
      if (statistics.score.average.value < statistics.score.median.value) {
        statistics.score.order = ['max', 'median', 'average', 'min'];
      } else {
        statistics.score.order = ['max', 'average', 'median', 'min'];
      }
    }
    this.statistics = statistics;
  }

  scoreToScoreRank(score: number): ScoreRank {
    for (let i = 0; i < Constants.SCORE_TO_SCORE_RANK_THRESHOLD.length; i++) {
      const element = Constants.SCORE_TO_SCORE_RANK_THRESHOLD[i];
      if (score >= element.score) {
        return element.scoreRank as ScoreRank;
      }
    }
    return Constants.SCORE_RANK.NO_PLAY as ScoreRank;
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
  getFilteredAndSorted(filterConditions: FilterCondition[], sortConditions: SortCondition[]): ChartList {
    /* filter */
    const chartList = new ChartList();
    this.charts.forEach(function (chartData) {
      let isMatched = true;
      filterConditions.forEach((condition) => {
        if (!condition.values.includes((chartData as unknown as Record<string, unknown>)[condition.attribute])) {
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

  static compareChartData(a: ChartData, b: ChartData, sortConditions: SortCondition[]): number {
    if (sortConditions.length === 0) {
      return 0;
    }
    const attribute = sortConditions[0].attribute;
    let lt = -1;
    let gt = 1;
    if (sortConditions[0].order === 'desc') {
      lt = 1;
      gt = -1;
    }
    const aVal = (a as unknown as Record<string, unknown>)[attribute] as number | string | null;
    const bVal = (b as unknown as Record<string, unknown>)[attribute] as number | string | null;
    if (aVal === bVal) {
      return this.compareChartData(a, b, sortConditions.slice(1));
    }
    if (aVal === null || (bVal !== null && aVal < bVal)) {
      return lt;
    }
    return gt;
  }
}
