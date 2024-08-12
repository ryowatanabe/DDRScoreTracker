import { ScoreDiff } from './ScoreDiff.js';
import { Constants } from './Constants.js';

export class ScoreDetail {
  constructor() {
    this.score = null;
    this.scoreRank = null;
    this.clearType = null;
    this.playCount = null;
    this.clearCount = null;
    this.flareRank = null;
    this.flareSkill = null;
    this.maxCombo = null;
  }

  static createFromStorage(storageData) {
    const instance = new ScoreDetail();
    Object.getOwnPropertyNames(storageData).forEach((attributeName) => {
      if (typeof storageData[attributeName] != 'undefined') {
        instance[attributeName] = storageData[attributeName];
      }
    });
    return instance;
  }

  clone() {
    return Object.assign(new ScoreDetail(), this);
  }

  merge(scoreDetail) {
    let isUpdated = false;
    const before = this.clone();
    const attributes = ['score', 'scoreRank', 'clearType', 'playCount', 'clearCount', 'flareRank', 'flareSkill', 'maxCombo'];
    attributes.forEach((attributeName) => {
      if (scoreDetail[attributeName] !== null) {
        if (this[attributeName] === null || scoreDetail[attributeName] > this[attributeName]) {
          isUpdated = true;
        }
        // データの手入力をしないので、常に外部から与えたデータ (サイトから取得したデータ) が正となる
        this[attributeName] = scoreDetail[attributeName];
      }
    });
    if (isUpdated) {
      return ScoreDiff.createFromScoreDetail(before, this);
    }
    return null;
  }

  get actualClearType() {
    if (this.clearType === null) {
      /* 可能な範囲でクリアタイプを自動判定する */
      if (this.score === null || this.scoreRank === null) {
        return Constants.CLEAR_TYPE.NO_PLAY;
      }
      if (this.clearCount === null) {
        switch (this.scoreRank) {
          case Constants.SCORE_RANK.NO_PLAY:
            return Constants.CLEAR_TYPE.NO_PLAY;
          case Constants.SCORE_RANK.E:
            return Constants.CLEAR_TYPE.FAILED;
          default:
            return Constants.CLEAR_TYPE.CLEAR;
        }
      } else if (this.clearCount == 0) {
        if (this.scoreRank > Constants.SCORE_RANK.E) {
          return Constants.CLEAR_TYPE.ASSIST_CLEAR;
        }
        return Constants.CLEAR_TYPE.FAILED;
      }
      return Constants.CLEAR_TYPE.CLEAR;
    }
    return this.clearType;
  }

  get actualScoreRank() {
    if (this.scoreRank === null) {
      return Constants.SCORE_RANK.NO_PLAY;
    }
    return this.scoreRank;
  }

  get actualFlareRank() {
    if (this.flareRank === null) {
      return Constants.FLARE_RANK.NONE;
    }
    return this.flareRank;
  }
}
