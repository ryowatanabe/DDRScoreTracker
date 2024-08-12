import { Constants } from './Constants.js';
import { ScoreDetail } from './ScoreDetail.js';
import { Util } from './Util.js';

export class ScoreDiff {
  constructor() {
    this.musicId = null;
    this.musicData = null;
    this.difficultyValue = null;
    this.before = null;
    this.after = null;
  }

  static createFromStorage(storageData) {
    const instance = new ScoreDiff();
    instance.musicId = storageData['musicId'];
    instance.difficultyValue = storageData['difficultyValue'];
    if (storageData['before'] !== null) {
      instance.before = ScoreDetail.createFromStorage(storageData['before']);
    }
    if (storageData['after'] !== null) {
      instance.after = ScoreDetail.createFromStorage(storageData['after']);
    }
    return instance;
  }

  static createMultiFromStorage(storageData) {
    const instances = [];
    storageData.forEach((data) => {
      instances.push(this.createFromStorage(data));
    }, this);
    return instances;
  }

  static createMultiFromScoreData(scoreData) {
    const differences = [];
    scoreData.difficulties.forEach((difficultyValue) => {
      const diff = new ScoreDiff();
      diff.musicId = scoreData.musicId;
      diff.difficultyValue = difficultyValue;
      diff.after = scoreData.getScoreDetailByDifficulty(difficultyValue).clone();
      differences.push(diff);
    });
    return differences;
  }

  static createFromScoreDetail(before, after) {
    const diff = new ScoreDiff();
    if (before !== null) {
      diff.before = before.clone();
    }
    if (after !== null) {
      diff.after = after.clone();
    }
    return diff;
  }

  get title() {
    if (this.musicData === null) {
      return this.musicId;
    }
    return this.musicData.title;
  }

  get playMode() {
    return Util.getPlayMode(this.difficultyValue);
  }

  get difficulty() {
    return Util.getDifficulty(this.difficultyValue);
  }

  get levelString() {
    if (this.level == 0) {
      return '?';
    }
    return String(this.level);
  }

  get level() {
    if (this.musicData === null) {
      return 0;
    }
    return this.musicData.getLevel(this.difficultyValue);
  }

  get beforeScore() {
    if (this.before === null) {
      return null;
    }
    return this.before.score;
  }

  get beforeScoreRank() {
    if (this.before === null) {
      return null;
    }
    return this.before.actualScoreRank;
  }

  get beforeFlareRank() {
    if (this.before === null) {
      return null;
    }
    return this.before.flareRank;
  }

  get beforeFlareSkill() {
    if (this.before === null) {
      return null;
    }
    return this.before.flareSkill;
  }

  get beforeClearType() {
    if (this.before === null) {
      return null;
    }
    return this.before.actualClearType;
  }

  get beforeScoreString() {
    if (this.beforeScore === null) {
      return '';
    }
    return this.beforeScore.toLocaleString();
  }

  get beforeClearTypeString() {
    if (this.beforeClearType === null) {
      return '';
    }
    return Constants.CLEAR_TYPE_STRING[this.beforeClearType];
  }

  get beforeFullComboSymbol() {
    if (this.beforeClearType === null) {
      return '';
    }
    return Constants.FULL_COMBO_SYMBOL[this.beforeClearType];
  }

  get beforeClearTypeClassString() {
    if (this.beforeClearType === null) {
      return '';
    }
    return Constants.CLEAR_TYPE_CLASS_STRING[this.beforeClearType];
  }

  get beforeFlareRankSymbol() {
    if (this.beforeFlareRank === null) {
      return '';
    }
    return Constants.FLARE_RANK_SYMBOL[this.beforeFlareRank];
  }

  get beforeFlareRankClassString() {
    if (this.beforeFlareRank === null) {
      return '';
    }
    return Constants.FLARE_RANK_CLASS_STRING[this.beforeFlareRank];
  }

  get beforeScoreRankString() {
    if (this.beforeScoreRank === null) {
      return '';
    }
    return Constants.SCORE_RANK_STRING[this.beforeScoreRank];
  }

  get beforeScoreRankClassString() {
    if (this.beforeScoreRank === null) {
      return '';
    }
    return Constants.SCORE_RANK_CLASS_STRING[this.beforeScoreRank];
  }

  get afterScore() {
    if (this.after === null) {
      return null;
    }
    return this.after.score;
  }

  get afterScoreRank() {
    if (this.after === null) {
      return null;
    }
    return this.after.actualScoreRank;
  }

  get afterFlareRank() {
    if (this.after === null) {
      return null;
    }
    return this.after.flareRank;
  }

  get afterFlareSkill() {
    if (this.after === null) {
      return null;
    }
    return this.after.flareSkill;
  }

  get afterClearType() {
    if (this.after === null) {
      return null;
    }
    return this.after.actualClearType;
  }

  get afterScoreString() {
    if (this.afterScore === null) {
      return '';
    }
    return this.afterScore.toLocaleString();
  }

  get afterClearTypeString() {
    if (this.afterClearType === null) {
      return '';
    }
    return Constants.CLEAR_TYPE_STRING[this.afterClearType];
  }

  get afterFullComboSymbol() {
    if (this.afterClearType === null) {
      return '';
    }
    return Constants.FULL_COMBO_SYMBOL[this.afterClearType];
  }

  get afterClearTypeClassString() {
    if (this.afterClearType === null) {
      return '';
    }
    return Constants.CLEAR_TYPE_CLASS_STRING[this.afterClearType];
  }

  get afterFlareRankSymbol() {
    if (this.afterFlareRank === null) {
      return '';
    }
    return Constants.FLARE_RANK_SYMBOL[this.afterFlareRank];
  }

  get afterFlareRankClassString() {
    if (this.afterFlareRank === null) {
      return '';
    }
    return Constants.FLARE_RANK_CLASS_STRING[this.afterFlareRank];
  }

  get afterScoreRankString() {
    if (this.afterScoreRank === null) {
      return '';
    }
    return Constants.SCORE_RANK_STRING[this.afterScoreRank];
  }

  get afterScoreRankClassString() {
    if (this.afterScoreRank === null) {
      return '';
    }
    return Constants.SCORE_RANK_CLASS_STRING[this.afterScoreRank];
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
