import { ScoreData } from './ScoreData.js';

export class ScoreList {
  musics = {};

  constrctor() {}

  static createFromStorage(storageData) {
    const instance = new ScoreList();
    Object.getOwnPropertyNames(storageData).forEach(function (musicId) {
      const scoreData = ScoreData.createFromStorage(storageData[musicId]);
      instance.applyScoreData(scoreData);
    });
    return instance;
  }

  applyScoreData(scoreData) {
    if (!this.hasMusic(scoreData.musicId)) {
      this.musics[scoreData.musicId] = scoreData;
      return;
    }
    this.getScoreDataByMusicId(scoreData.musicId).merge(scoreData);
  }

  applyObject(object) {
    const scoreData = ScoreData.createFromStorage(object);
    if (scoreData === null) {
      return false;
    }
    this.applyScoreData(scoreData);
    return true;
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
