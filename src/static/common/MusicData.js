import { Constants } from './Constants.js';
import { Logger } from './Logger.js';

export class MusicData {
  constructor(musicId, type, title, difficulty, isDeleted) {
    this.musicId = musicId;
    this.type = type;
    this.title = title;
    this.difficulty = difficulty;
    this.isDeleted = isDeleted;
  }

  static createEmptyData(musicId, musicType) {
    return new MusicData(musicId, musicType, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  }

  static createFromStorage(storageData) {
    const instance = new MusicData(storageData['musicId'], storageData['type'], storageData['title'], storageData['difficulty'], storageData['isDeleted']);
    return instance;
  }

  static createFromString(encodedString) {
    if (encodedString.trim() == '') {
      return null;
    }
    const elements = encodedString.split('\t');
    if (elements.length != 13) {
      Logger.error(`MusicData.create invalid string: ${encodedString}`);
      return null;
    }
    const instance = new MusicData(
      elements[0],
      parseInt(elements[1], 10),
      elements[12],
      elements.slice(3, 12).map((element) => parseInt(element, 10)),
      parseInt(elements[2], 10)
    );
    return instance;
  }

  /*
  引数に与えられたmusicDataの方により新しいデータがあればこのオブジェクトに反映
  更新が発生した場合 true, そうでない場合 false を返す
  */
  merge(musicData) {
    if (this.musicId != musicData.musicId) {
      throw new Error(`musicId mismatch: ${this.musicId}, ${musicData.musicId}`);
    }
    const iterator = this.difficulty.keys();
    let isUpdated = false;
    for (const index of iterator) {
      if (musicData.difficulty[index] != 0 && this.difficulty[index] != musicData.difficulty[index]) {
        isUpdated = true;
        this.difficulty[index] = musicData.difficulty[index];
      }
    }
    if (musicData.type != Constants.MUSIC_TYPE.UNKNOWN && this.type != musicData.type) {
      isUpdated = true;
      this.type = musicData.type;
    }
    if (musicData.title != '' && this.title != musicData.title) {
      isUpdated = true;
      this.title = musicData.title;
    }
    if (this.isDeleted != musicData.isDeleted) {
      isUpdated = true;
      this.isDeleted = musicData.isDeleted;
    }
    return isUpdated;
  }

  getLevel(index) {
    return this.difficulty[index];
  }

  hasDifficulty(index) {
    return this.difficulty[index] != 0;
  }

  get encodedString() {
    return [this.musicId, this.type, this.isDeleted, this.difficulty, this.title].flat().join('\t');
  }
}
