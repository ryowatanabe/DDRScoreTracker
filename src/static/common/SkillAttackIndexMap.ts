import { Logger } from './Logger.js';

export class SkillAttackIndexMap {
  indexToMusicIdMap: Record<number, string>;
  musicIdToIndexMap: Record<string, number>;

  constructor() {
    this.indexToMusicIdMap = {};
    this.musicIdToIndexMap = {};
  }

  static createFromText(text: string): SkillAttackIndexMap {
    const instance = new SkillAttackIndexMap();
    const lines = text.split('\n');
    Logger.debug(`SkillAttackIndexMap.createFromText: text contains ${lines.length} elements.`);
    lines.forEach((line) => {
      if (line.trim() === '') {
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

  hasIndex(index: number): boolean {
    return Object.prototype.hasOwnProperty.call(this.indexToMusicIdMap, index);
  }

  hasMusicId(musicId: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.musicIdToIndexMap, musicId);
  }

  getMusicIdByIndex(index: number): string {
    return this.indexToMusicIdMap[index];
  }

  getIndexByMusicId(musicId: string): number {
    return this.musicIdToIndexMap[musicId];
  }
}
