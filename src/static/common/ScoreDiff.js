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

  toStorageData() {
    return {
      musicId: this.musicId,
      difficultyValue: this.difficultyValue,
      before: this.before !== null ? Object.assign({}, this.before) : null,
      after: this.after !== null ? Object.assign({}, this.after) : null,
    };
  }

  #getDetailField(detail, field) {
    return detail === null ? null : detail[field];
  }

  #lookupOrEmpty(value, table) {
    return value === null ? '' : table[value];
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
    if (this.level === 0) {
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
    return this.#getDetailField(this.before, 'score');
  }

  get beforeScoreRank() {
    return this.#getDetailField(this.before, 'actualScoreRank');
  }

  get beforeFlareRank() {
    return this.#getDetailField(this.before, 'flareRank');
  }

  get beforeFlareSkill() {
    return this.#getDetailField(this.before, 'flareSkill');
  }

  get beforeClearType() {
    return this.#getDetailField(this.before, 'actualClearType');
  }

  get beforeScoreString() {
    return this.beforeScore === null ? '' : this.beforeScore.toLocaleString();
  }

  get beforeClearTypeString() {
    return this.#lookupOrEmpty(this.beforeClearType, Constants.CLEAR_TYPE_STRING);
  }

  get beforeFullComboSymbol() {
    return this.#lookupOrEmpty(this.beforeClearType, Constants.FULL_COMBO_SYMBOL);
  }

  get beforeClearTypeClassString() {
    return this.#lookupOrEmpty(this.beforeClearType, Constants.CLEAR_TYPE_CLASS_STRING);
  }

  get beforeFlareRankSymbol() {
    return this.#lookupOrEmpty(this.beforeFlareRank, Constants.FLARE_RANK_SYMBOL);
  }

  get beforeFlareRankClassString() {
    return this.#lookupOrEmpty(this.beforeFlareRank, Constants.FLARE_RANK_CLASS_STRING);
  }

  get beforeScoreRankString() {
    return this.#lookupOrEmpty(this.beforeScoreRank, Constants.SCORE_RANK_STRING);
  }

  get beforeScoreRankClassString() {
    return this.#lookupOrEmpty(this.beforeScoreRank, Constants.SCORE_RANK_CLASS_STRING);
  }

  get afterScore() {
    return this.#getDetailField(this.after, 'score');
  }

  get afterScoreRank() {
    return this.#getDetailField(this.after, 'actualScoreRank');
  }

  get afterFlareRank() {
    return this.#getDetailField(this.after, 'flareRank');
  }

  get afterFlareSkill() {
    return this.#getDetailField(this.after, 'flareSkill');
  }

  get afterClearType() {
    return this.#getDetailField(this.after, 'actualClearType');
  }

  get afterScoreString() {
    return this.afterScore === null ? '' : this.afterScore.toLocaleString();
  }

  get afterClearTypeString() {
    return this.#lookupOrEmpty(this.afterClearType, Constants.CLEAR_TYPE_STRING);
  }

  get afterFullComboSymbol() {
    return this.#lookupOrEmpty(this.afterClearType, Constants.FULL_COMBO_SYMBOL);
  }

  get afterClearTypeClassString() {
    return this.#lookupOrEmpty(this.afterClearType, Constants.CLEAR_TYPE_CLASS_STRING);
  }

  get afterFlareRankSymbol() {
    return this.#lookupOrEmpty(this.afterFlareRank, Constants.FLARE_RANK_SYMBOL);
  }

  get afterFlareRankClassString() {
    return this.#lookupOrEmpty(this.afterFlareRank, Constants.FLARE_RANK_CLASS_STRING);
  }

  get afterScoreRankString() {
    return this.#lookupOrEmpty(this.afterScoreRank, Constants.SCORE_RANK_STRING);
  }

  get afterScoreRankClassString() {
    return this.#lookupOrEmpty(this.afterScoreRank, Constants.SCORE_RANK_CLASS_STRING);
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
