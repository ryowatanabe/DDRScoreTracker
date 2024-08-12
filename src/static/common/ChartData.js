import { Constants } from './Constants.js';
import { Util } from './Util.js';

export class ChartData {
  constructor(musicId, playMode, difficulty) {
    this.musicId = musicId;
    this.playMode = playMode;
    this.difficulty = difficulty;
    this.musicData = null;
    this.scoreDetail = null;
  }

  get musicType() {
    if (this.musicData == null) {
      return Constants.MUSIC_TYPE.UNKNOWN;
    }
    return this.musicData.type;
  }

  get title() {
    if (this.musicData == null) {
      return this.musicId;
    }
    if (this.musicData.title == '') {
      return this.musicId;
    }
    return this.musicData.title;
  }

  get levelString() {
    if (this.level == 0) {
      return '?';
    }
    return String(this.level);
  }

  get level() {
    if (this.musicData == null) {
      return 0;
    }
    return this.musicData.getLevel(Util.getDifficultyValue(this.playMode, this.difficulty));
  }

  get availability() {
    // 0: available
    // 1: deleted music with score
    // 2: deleted music without score
    if (this.musicData == null) {
      return 0;
    }
    if (this.musicData.isDeleted) {
      if (this.scoreDetail === null) {
        return 2;
      }
      return 1;
    }
    return 0;
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
    return this.scoreDetail.actualScoreRank;
  }

  get clearType() {
    if (this.scoreDetail === null) {
      return Constants.CLEAR_TYPE.NO_PLAY;
    }
    return this.scoreDetail.actualClearType;
  }

  get flareRank() {
    if (this.scoreDetail === null) {
      return Constants.FLARE_RANK.NONE;
    }
    return this.scoreDetail.actualFlareRank;
  }

  get flareSkill() {
    if (this.scoreDetail === null) {
      return null;
    }
    return this.scoreDetail.flareSkill;
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

  get flareRankString() {
    if (this.scoreDetail === null || this.scoreDetail.flareRank === null) {
      return '';
    }
    return Constants.FLARE_RANK_STRING[this.scoreDetail.flareRank];
  }

  get flareRankClassString() {
    if (this.scoreDetail === null || this.scoreDetail.flareRank === null) {
      return '';
    }
    return Constants.FLARE_RANK_CLASS_STRING[this.scoreDetail.flareRank];
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
