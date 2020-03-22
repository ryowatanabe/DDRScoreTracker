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
    return musicData.getLevel(index);
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
}
