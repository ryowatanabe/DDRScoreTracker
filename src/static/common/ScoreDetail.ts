import { ScoreDiff } from './ScoreDiff.js';
import { Constants, type ClearType, type ScoreRank, type FlareRank } from './Constants.js';

export class NullScoreDetail {
  score: null = null;
  scoreRank: null = null;
  clearType: null = null;
  playCount: null = null;
  clearCount: null = null;
  flareRank: null = null;
  flareSkill: null = null;
  maxCombo: null = null;

  get actualClearType(): ClearType {
    return Constants.CLEAR_TYPE.NO_PLAY as ClearType;
  }

  get actualScoreRank(): ScoreRank {
    return Constants.SCORE_RANK.NO_PLAY as ScoreRank;
  }

  get actualFlareRank(): FlareRank {
    return Constants.FLARE_RANK.NONE as FlareRank;
  }
}

export class ScoreDetail {
  score: number | null = null;
  scoreRank: ScoreRank | null = null;
  clearType: ClearType | null = null;
  playCount: number | null = null;
  clearCount: number | null = null;
  flareRank: FlareRank | null = null;
  flareSkill: number | null = null;
  maxCombo: number | null = null;

  static createFromStorage(storageData: Record<string, unknown>): ScoreDetail {
    const instance = new ScoreDetail();
    Object.getOwnPropertyNames(storageData).forEach((attributeName) => {
      if (typeof storageData[attributeName] !== 'undefined') {
        (instance as unknown as Record<string, unknown>)[attributeName] = storageData[attributeName];
      }
    });
    return instance;
  }

  clone(): ScoreDetail {
    return Object.assign(new ScoreDetail(), this);
  }

  merge(scoreDetail: ScoreDetail): ScoreDiff | null {
    let isUpdated = false;
    const before = this.clone();
    const attributes: (keyof ScoreDetail)[] = ['score', 'scoreRank', 'clearType', 'playCount', 'clearCount', 'flareRank', 'flareSkill', 'maxCombo'];
    attributes.forEach((attributeName) => {
      if (scoreDetail[attributeName] !== null) {
        if (this[attributeName] === null || (scoreDetail[attributeName] as number) > (this[attributeName] as number)) {
          isUpdated = true;
        }
        // データの手入力をしないので、常に外部から与えたデータ (サイトから取得したデータ) が正となる
        (this as unknown as Record<string, unknown>)[attributeName as string] = scoreDetail[attributeName];
      }
    });
    if (isUpdated) {
      return ScoreDiff.createFromScoreDetail(before, this);
    }
    return null;
  }

  get actualClearType(): ClearType {
    if (this.clearType === null) {
      /* 可能な範囲でクリアタイプを自動判定する */
      if (this.score === null || this.scoreRank === null) {
        return Constants.CLEAR_TYPE.NO_PLAY as ClearType;
      }
      if (this.clearCount === null) {
        switch (this.scoreRank) {
          case Constants.SCORE_RANK.NO_PLAY:
            return Constants.CLEAR_TYPE.NO_PLAY as ClearType;
          case Constants.SCORE_RANK.E:
            return Constants.CLEAR_TYPE.FAILED as ClearType;
          default:
            return Constants.CLEAR_TYPE.CLEAR as ClearType;
        }
      } else if (this.clearCount === 0) {
        if (this.scoreRank > Constants.SCORE_RANK.E) {
          return Constants.CLEAR_TYPE.ASSIST_CLEAR as ClearType;
        }
        return Constants.CLEAR_TYPE.FAILED as ClearType;
      }
      return Constants.CLEAR_TYPE.CLEAR as ClearType;
    }
    return this.clearType;
  }

  get actualScoreRank(): ScoreRank {
    if (this.scoreRank === null) {
      return Constants.SCORE_RANK.NO_PLAY as ScoreRank;
    }
    return this.scoreRank;
  }

  get actualFlareRank(): FlareRank {
    if (this.flareRank === null) {
      return Constants.FLARE_RANK.NONE as FlareRank;
    }
    return this.flareRank;
  }
}
