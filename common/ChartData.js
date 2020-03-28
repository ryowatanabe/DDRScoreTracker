class ChartData {
  musicId     = null;
  playMode    = null;
  difficulty  = null;
  musicData   = null;
  scoreDetail = null;

  constructor(musicId, playMode, difficulty) {
    this.musicId     = musicId;
    this.playMode    = playMode;
    this.difficulty  = difficulty;
  }

  get title(){
    return this.musicData.title;
  }

  get level(){
    const index = this.difficulty + (this.playMode == PLAY_MODE.DOUBLE ? DIFFICULTIES_OFFSET_FOR_DOUBLE : 0);
    return this.musicData.getLevel(index);
  }

  get score() {
    if (this.scoreDetail === null){
      return null;
    }
    return this.scoreDetail.score;
  }

  get scoreRank() {
    if (this.scoreDetail === null){
      return null;
    }
    return this.scoreDetail.scoreRank;
  }

  get clearType() {
    if (this.scoreDetail === null){
      return null;
    }
    return this.scoreDetail.actualClearType;
  }

  get playCount() {
    if (this.scoreDetail === null){
      return null;
    }
    return this.scoreDetail.playCount;
  }

  get clearCount() {
    if (this.scoreDetail === null){
      return null;
    }
    return this.scoreDetail.clearCount;
  }

  get maxCombo() {
    if (this.scoreDetail === null){
      return null;
    }
    return this.scoreDetail.maxCombo;
  }

  get scoreString() {
    if (this.scoreDetail === null || this.scoreDetail.score === null){
      return "";
    }
    return this.scoreDetail.score.toLocaleString();
  }

  get clearTypeString() {
    if (this.scoreDetail === null || this.scoreDetail.clearType === null){
      return "";
    }
    return CLEAR_TYPE_STRING[this.scoreDetail.clearType];
  }

  get fullComboSymbol() {
    if (this.scoreDetail === null || this.scoreDetail.clearType === null){
      return "";
    }
    return FULL_COMBO_SYMBOL[this.scoreDetail.clearType];
  }

  get clearTypeClassString() {
    if (this.scoreDetail === null || this.scoreDetail.clearType === null){
      return "";
    }
    return CLEAR_TYPE_CLASS_STRING[this.scoreDetail.clearType];
  }

  get scoreRankString() {
    if (this.scoreDetail === null || this.scoreDetail.scoreRank === null){
      return "";
    }
    return SCORE_RANK_STRING[this.scoreDetail.scoreRank];
  }

  get scoreRankClassString() {
    if (this.scoreDetail === null || this.scoreDetail.scoreRank === null){
      return "";
    }
    return SCORE_RANK_CLASS_STRING[this.scoreDetail.scoreRank];
  }

  get difficultyClassString() {
    if (this.difficulty === null){
      return "";
    }
    return DIFFICULTY_CLASS_STRING[this.difficulty];
  }

  get playModeSymbol() {
    if (this.playMode === null){
      return "";
    }
    return PLAY_MODE_SYMBOL[this.playMode];
  }
}

class ChartList {
  charts = [];

  constructor() {
  }

  reset() {
    this.charts = [];
  }

  addChartData(chartData) {
    this.charts.push(chartData);
  }

  get statistics() {
    const statistics = {
      clearType: []
    };
    Object.values(CLEAR_TYPE).forEach(function(clearType){
      statistics.clearType.push({
        clearType: clearType,
        clearTypeString: CLEAR_TYPE_STRING[clearType],
        clearTypeClassString: CLEAR_TYPE_CLASS_STRING[clearType],
        count: this.charts.filter(chartData => { return chartData.clearType == clearType }).length,
      });
    }.bind(this));
    statistics.clearType.sort(function(a, b){
      if (a.clearType > b.clearType){
        return -1;
      } else if (a.clearType < b.clearType){
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
    this.charts.forEach(function(chartData){
      let isMatched = true;
      filterConditions.forEach(condition => {
        if(!condition.values.includes(chartData[condition.attribute])){
          isMatched = false;
        }
      });
      if (isMatched) {
        chartList.addChartData(chartData);
      }
    });
    chartList.charts.sort(function(a, b){
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
    if (sortConditions[0].order == "desc") {
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
