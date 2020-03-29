import { ScoreDetail } from './ScoreDetail.js';

export class ScoreData {
  musicId    = "";
  difficulty = {};

  constructor(musicId) {
    this.musicId = musicId;
  }

  static createFromStorage(storageData) {
    const instance = new ScoreData(storageData["musicId"]);
    Object.getOwnPropertyNames(storageData["difficulty"]).forEach(function(index){
      instance.difficulty[index] = ScoreDetail.createFromStorage(storageData["difficulty"][index]);
    });
    return instance;
  }

  applyScoreDetail(difficultyValue, scoreDetail) {
    if (!this.hasDifficulty(difficultyValue)) {
      this.difficulty[difficultyValue] = scoreDetail;
      return;
    }
    this.getScoreDetailByDifficulty(difficultyValue).merge(scoreDetail);
  }

  merge(scoreData) {
    scoreData.difficulties.forEach((difficultyValue) => {
      this.applyScoreDetail(difficultyValue, scoreData.getScoreDetailByDifficulty(difficultyValue));
    });
  }

  getScoreDetailByDifficulty(difficultyValue) {
    return this.difficulty[difficultyValue];
  }

  hasDifficulty(difficultyValue) {
    return this.difficulty.hasOwnProperty(difficultyValue);
  }

  get difficulties(){
    return Object.getOwnPropertyNames(this.difficulty);
  }
}
