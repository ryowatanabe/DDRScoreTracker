import { Logger } from './Logger.js';

export class SkillAttackIndexMap {
  constructor() {
    this.indexToMusicIdMap = {};
    this.musicIdToIndexMap = {};
  }

  static createFromText(text) {
    const instance = new SkillAttackIndexMap();
    const lines = text.split('\n');
    Logger.debug(`SkillAttackIndexMap.createFromText: text contains ${lines.length} elements.`);
    lines.forEach((line) => {
      if (line.trim() == '') {
        return;
      }
      const elements = line.split('\t');
      const index = parseInt(elements[0], 10);
      const musicId = elements[1];
      instance.indexToMusicIdMap[index] = musicId;
      instance.musicIdToIndexMap[musicId] = index;
    });
    return instance;
  }

  hasIndex(index) {
    return this.indexToMusicIdMap.hasOwnProperty(index);
  }

  hasMusicId(musicId) {
    return this.musicIdToIndexMap.hasOwnProperty(musicId);
  }

  getMusicIdByIndex(index) {
    return this.indexToMusicIdMap[index];
  }

  getIndexByMusicId(musicId) {
    return this.musicIdToIndexMap[musicId];
  }
}
