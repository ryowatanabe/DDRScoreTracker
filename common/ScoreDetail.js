import { Constants } from './Constants.js';

export class ScoreDetail {
  score      = null;
  scoreRank  = null;
  clearType  = null;
  playCount  = null;
  clearCount = null;
  maxCombo   = null;

  constructor() {
  }

  static createFromStorage(storageData) {
    const instance = new ScoreDetail();
    Object.getOwnPropertyNames(storageData).forEach(attributeName => {
      if(typeof(storageData[attributeName]) != 'undefined') {
        instance[attributeName] = storageData[attributeName];
      }
    });
    return instance;
  }

  merge(scoreDetail) {
    const attributes = [
      "score", "scoreRank", "clearType", "playCount", "clearCount", "maxCombo"
    ];
    attributes.forEach(function(attributeName) {
      if (scoreDetail[attributeName] !== null) {
        if (this[attributeName] === null || scoreDetail[attributeName] > this[attributeName]) {
          this[attributeName] = scoreDetail[attributeName];
        }
      }
    }.bind(this));
  }

  get actualClearType() {
    if (this.clearType === null){
      /* 可能な範囲でクリアタイプを自動判定する */
      if (this.score === null || this.scoreRank === null) {
        return Constants.CLEAR_TYPE.NO_PLAY;
      }
      if (this.clearCount === null) {
        switch (this.scoreRank) {
          case Constants.SCORE_RANK.NO_PLAY:
            return Constants.CLEAR_TYPE.NO_PLAY;
            break;
          case Constants.SCORE_RANK.E:
            return Constants.CLEAR_TYPE.FAILED;
            break;
          default:
            return Constants.CLEAR_TYPE.CLEAR;
            break;
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
}
