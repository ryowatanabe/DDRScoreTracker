import { ScoreDetail } from './ScoreDetail.js';
import { ScoreDiff } from './ScoreDiff.js';

export class ScoreData {
  constructor(musicId) {
    this.musicId = musicId;
    this.difficulty = {};
  }

  static createFromStorage(storageData) {
    const instance = new ScoreData(storageData['musicId']);
    Object.getOwnPropertyNames(storageData['difficulty']).forEach(function (index) {
      instance.difficulty[index] = ScoreDetail.createFromStorage(storageData['difficulty'][index]);
    });
    return instance;
  }

  applyScoreDetail(difficultyValue, scoreDetail) {
    if (!this.hasDifficulty(difficultyValue)) {
      this.difficulty[difficultyValue] = scoreDetail;
      const diff = ScoreDiff.createFromScoreDetail(null, scoreDetail);
      diff.musicId = this.musicId;
      diff.difficulty = difficultyValue;
      return diff;
    }
    const diff = this.getScoreDetailByDifficulty(difficultyValue).merge(scoreDetail);
    if (diff !== null) {
      diff.musicId = this.musicId;
      diff.difficulty = difficultyValue;
    }
    return diff;
  }

  merge(scoreData) {
    const differences = [];
    scoreData.difficulties.forEach((difficultyValue) => {
      const diff = this.applyScoreDetail(difficultyValue, scoreData.getScoreDetailByDifficulty(difficultyValue));
      if (diff !== null) {
        differences.push(diff);
      }
    });
    return differences;
  }

  getScoreDetailByDifficulty(difficultyValue) {
    return this.difficulty[difficultyValue];
  }

  hasDifficulty(difficultyValue) {
    return this.difficulty.hasOwnProperty(difficultyValue);
  }

  get difficulties() {
    return Object.getOwnPropertyNames(this.difficulty);
  }
}
