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

  get fullComboTypeString() {
    if (this.scoreDetail === null || this.scoreDetail.clearType === null){
      return "";
    }
    return FULL_COMBO_TYPE_STRING[this.scoreDetail.clearType];
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
    const statistics = {};
    statistics['clearType'] = {
      marvelous_fc: this.charts.filter(chartData => { return chartData.clearType == CLEAR_TYPE.MARVELOUS_FC }).length,
      perfect_fc:   this.charts.filter(chartData => { return chartData.clearType == CLEAR_TYPE.PERFECT_FC }).length,
      great_fc:     this.charts.filter(chartData => { return chartData.clearType == CLEAR_TYPE.GREAT_FC }).length,
      good_fc:      this.charts.filter(chartData => { return chartData.clearType == CLEAR_TYPE.GOOD_FC }).length,
      life4:        this.charts.filter(chartData => { return chartData.clearType == CLEAR_TYPE.LIFE4 }).length,
      clear:        this.charts.filter(chartData => { return chartData.clearType == CLEAR_TYPE.CLEAR }).length,
      assist_clear: this.charts.filter(chartData => { return chartData.clearType == CLEAR_TYPE.ASSIST_CLEAR }).length,
      failed:       this.charts.filter(chartData => { return chartData.clearType == CLEAR_TYPE.FAILED }).length,
      no_play:      this.charts.filter(chartData => { return chartData.clearType == CLEAR_TYPE.NO_PLAY }).length
    };
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
  */
  getFilteredAndSorted(filterConditions /*, sortConditions */) {
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
    /* ToDo: customizable sort */
    chartList.charts.sort(function(a, b){
      if (a.score > b.score){
        return -1;
      } else if (a.score < b.score){
        return 1;
      } else {
        if (a.title < b.title){
          return -1;
        } else if (a.title > b.title){
          return 1;
        }
      }
      return 0;
    });
    return chartList;
  }
}
