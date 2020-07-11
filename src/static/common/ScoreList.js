import { ScoreData } from './ScoreData.js';
import { ScoreDiff } from './ScoreDiff.js';

export class ScoreList {
  constructor() {
    this.musics = {};
  }

  static createFromStorage(storageData) {
    const instance = new ScoreList();
    Object.getOwnPropertyNames(storageData).forEach((musicId) => {
      const scoreData = ScoreData.createFromStorage(storageData[musicId]);
      instance.applyScoreData(scoreData);
    });
    return instance;
  }

  applyScoreData(scoreData) {
    if (!this.hasMusic(scoreData.musicId)) {
      this.musics[scoreData.musicId] = scoreData;
      return ScoreDiff.createMultiFromScoreData(scoreData);
    }
    return this.getScoreDataByMusicId(scoreData.musicId).merge(scoreData);
  }

  applyObject(object) {
    const scoreData = ScoreData.createFromStorage(object);
    if (scoreData === null) {
      return [];
    }
    return this.applyScoreData(scoreData);
  }

  getScoreDataByMusicId(musicId) {
    return this.musics[musicId];
  }

  hasMusic(musicId) {
    return this.musics.hasOwnProperty(musicId);
  }

  get musicIds() {
    return Object.getOwnPropertyNames(this.musics);
  }
}
