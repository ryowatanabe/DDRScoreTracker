import { Constants } from './Constants.js';
import { Util } from './Util.js';
import { NullScoreDetail } from './ScoreDetail.js';

export class ChartData {
  constructor(musicId, playMode, difficulty) {
    this.musicId = musicId;
    this.playMode = playMode;
    this.difficulty = difficulty;
    this.musicData = null;
    this.scoreDetail = new NullScoreDetail();
  }

  get musicType() {
    if (this.musicData === null) {
      return Constants.MUSIC_TYPE.UNKNOWN;
    }
    return this.musicData.type;
  }

  get title() {
    if (this.musicData === null) {
      return this.musicId;
    }
    if (this.musicData.title === '') {
      return this.musicId;
    }
    return this.musicData.title;
  }

  get levelString() {
    if (this.level === 0) {
      return '?';
    }
    return String(this.level);
  }

  get level() {
    if (this.musicData === null) {
      return 0;
    }
    return this.musicData.getLevel(Util.getDifficultyValue(this.playMode, this.difficulty));
  }

  get availability() {
    // 0: available
    // 1: deleted music with score
    // 2: deleted music without score
    if (this.musicData === null) {
      return 0;
    }
    if (this.musicData.isDeleted) {
      if (this.scoreDetail.score === null) {
        return 2;
      }
      return 1;
    }
    return 0;
  }

  get score() {
    return this.scoreDetail.score;
  }

  get scoreRank() {
    return this.scoreDetail.actualScoreRank;
  }

  get clearType() {
    return this.scoreDetail.actualClearType;
  }

  get flareRank() {
    return this.scoreDetail.actualFlareRank;
  }

  get flareSkill() {
    return this.scoreDetail.flareSkill;
  }

  get playCount() {
    return this.scoreDetail.playCount;
  }

  get clearCount() {
    return this.scoreDetail.clearCount;
  }

  get maxCombo() {
    return this.scoreDetail.maxCombo;
  }

  get scoreString() {
    if (this.scoreDetail.score === null) {
      return '';
    }
    return this.scoreDetail.score.toLocaleString();
  }

  get clearTypeString() {
    if (this.scoreDetail.clearType === null) {
      return '';
    }
    return Constants.CLEAR_TYPE_STRING[this.scoreDetail.clearType];
  }

  get fullComboSymbol() {
    if (this.scoreDetail.clearType === null) {
      return '';
    }
    return Constants.FULL_COMBO_SYMBOL[this.scoreDetail.clearType];
  }

  get clearTypeClassString() {
    if (this.scoreDetail.clearType === null) {
      return '';
    }
    return Constants.CLEAR_TYPE_CLASS_STRING[this.scoreDetail.clearType];
  }

  get scoreRankString() {
    if (this.scoreDetail.scoreRank === null) {
      return '';
    }
    return Constants.SCORE_RANK_STRING[this.scoreDetail.scoreRank];
  }

  get scoreRankClassString() {
    if (this.scoreDetail.scoreRank === null) {
      return '';
    }
    return Constants.SCORE_RANK_CLASS_STRING[this.scoreDetail.scoreRank];
  }

  get flareRankSymbol() {
    if (this.scoreDetail.flareRank === null) {
      return '';
    }
    return Constants.FLARE_RANK_SYMBOL[this.scoreDetail.flareRank];
  }

  get flareRankString() {
    if (this.scoreDetail.flareRank === null) {
      return '';
    }
    return Constants.FLARE_RANK_STRING[this.scoreDetail.flareRank];
  }

  get flareRankClassString() {
    if (this.scoreDetail.flareRank === null) {
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
