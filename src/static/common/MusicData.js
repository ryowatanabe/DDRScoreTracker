import { Constants } from './Constants.js';
import { Logger } from './Logger.js';

export class MusicData {
  musicId = '';
  type = Constants.MUSIC_TYPE.NORMAL;
  title = '';
  difficulty = [0, 0, 0, 0, 0, 0, 0, 0, 0];

  constructor(musicId, type, title, difficulty) {
    this.musicId = musicId;
    this.type = type;
    this.title = title;
    this.difficulty = difficulty;
  }

  static createFromStorage(storageData) {
    const instance = new MusicData(storageData['musicId'], storageData['type'], storageData['title'], storageData['difficulty']);
    return instance;
  }

  static createFromString(encodedString) {
    if (encodedString.trim() == '') {
      return null;
    }
    const elements = encodedString.split('\t');
    if (elements.length != 12) {
      Logger.error(`MusicData.create invalid string: ${encodedString}`);
      return null;
    }
    const instance = new MusicData(
      elements[0],
      parseInt(elements[1], 10),
      elements[11],
      elements.slice(2, 11).map((element) => parseInt(element, 10))
    );
    return instance;
  }

  /*
  引数に与えられたmusicDataの方により新しいデータがあればこのオブジェクトに反映
  更新が発生した場合 true, そうでない場合 false を返す
  */
  merge(musicData) {
    const iterator = this.difficulty.keys();
    let isUpdated = false;
    for (const index of iterator) {
      if (this.difficulty[index] == 0 && musicData.difficulty[index] != 0) {
        isUpdated = true;
        this.difficulty[index] = musicData.difficulty[index];
      }
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
    return [this.musicId, this.type, this.difficulty, this.title].flat().join('\t');
  }
}
