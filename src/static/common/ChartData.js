import { Constants } from './Constants.js';

export class ChartData {
  constructor(musicId, playMode, difficulty) {
    this.musicId = musicId;
    this.playMode = playMode;
    this.difficulty = difficulty;
    this.musicData = null;
    this.scoreDetail = null;
  }

  get musicType() {
    return this.musicData.type;
  }

  get title() {
    return this.musicData.title;
  }

  get level() {
    const index = this.difficulty + (this.playMode == Constants.PLAY_MODE.DOUBLE ? Constants.DIFFICULTIES_OFFSET_FOR_DOUBLE : 0);
    return this.musicData.getLevel(index);
  }

  get score() {
    if (this.scoreDetail === null) {
      return null;
    }
    return this.scoreDetail.score;
  }

  get scoreRank() {
    if (this.scoreDetail === null) {
      return null;
    }
    return this.scoreDetail.scoreRank;
  }

  get clearType() {
    if (this.scoreDetail === null) {
      return null;
    }
    return this.scoreDetail.actualClearType;
  }

  get playCount() {
    if (this.scoreDetail === null) {
      return null;
    }
    return this.scoreDetail.playCount;
  }

  get clearCount() {
    if (this.scoreDetail === null) {
      return null;
    }
    return this.scoreDetail.clearCount;
  }

  get maxCombo() {
    if (this.scoreDetail === null) {
      return null;
    }
    return this.scoreDetail.maxCombo;
  }

  get scoreString() {
    if (this.scoreDetail === null || this.scoreDetail.score === null) {
      return '';
    }
    return this.scoreDetail.score.toLocaleString();
  }

  get clearTypeString() {
    if (this.scoreDetail === null || this.scoreDetail.clearType === null) {
      return '';
    }
    return Constants.CLEAR_TYPE_STRING[this.scoreDetail.clearType];
  }

  get fullComboSymbol() {
    if (this.scoreDetail === null || this.scoreDetail.clearType === null) {
      return '';
    }
    return Constants.FULL_COMBO_SYMBOL[this.scoreDetail.clearType];
  }

  get clearTypeClassString() {
    if (this.scoreDetail === null || this.scoreDetail.clearType === null) {
      return '';
    }
    return Constants.CLEAR_TYPE_CLASS_STRING[this.scoreDetail.clearType];
  }

  get scoreRankString() {
    if (this.scoreDetail === null || this.scoreDetail.scoreRank === null) {
      return '';
    }
    return Constants.SCORE_RANK_STRING[this.scoreDetail.scoreRank];
  }

  get scoreRankClassString() {
    if (this.scoreDetail === null || this.scoreDetail.scoreRank === null) {
      return '';
    }
    return Constants.SCORE_RANK_CLASS_STRING[this.scoreDetail.scoreRank];
  }

  get difficultyClassString() {
    if (this.difficulty === null) {
      return '';
    }
    return Constants.DIFFICULTY_CLASS_STRING[this.difficulty];
  }

  get playModeSymbol() {
    if (this.playMode === null) {
      return '';
    }
    return Constants.PLAY_MODE_SYMBOL[this.playMode];
  }
}
