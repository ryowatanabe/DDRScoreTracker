import { MusicData } from './MusicData.js';
import { Logger } from './Logger.js';

export class MusicList {
  constructor() {
    this.musics = {};
  }

  static createFromStorage(storageData) {
    const instance = new MusicList();
    Object.getOwnPropertyNames(storageData).forEach((musicId) => {
      const musicData = MusicData.createFromStorage(storageData[musicId]);
      instance.applyMusicData(musicData);
    });
    return instance;
  }

  /*
  更新があればtrue, なければfalseを返す
  */
  applyMusicData(musicData) {
    if (musicData.isDeleted == 2) {
      if (this.removeMusic(musicData.musicId)) {
        Logger.info(`Removed: ${musicData.encodedString}`);
        return true;
      }
    } else if (this.hasMusic(musicData.musicId)) {
      if (this.getMusicDataById(musicData.musicId).merge(musicData)) {
        Logger.info(`Modified: ${this.getMusicDataById(musicData.musicId).encodedString}`);
        return true;
      }
    } else {
      Logger.info(`Added: ${musicData.encodedString}`);
      this.musics[musicData.musicId] = musicData;
      return true;
    }
    return false;
  }

  applyObject(object) {
    const musicData = MusicData.createFromStorage(object);
    if (musicData === null) {
      return false;
    }
    return this.applyMusicData(musicData);
  }

  applyEncodedString(encodedString) {
    const musicData = MusicData.createFromString(encodedString);
    if (musicData === null) {
      return false;
    }
    return this.applyMusicData(musicData);
  }

  getMusicDataById(musicId) {
    return this.musics[musicId];
  }

  hasMusic(musicId) {
    return Object.prototype.hasOwnProperty.call(this.musics, musicId);
  }

  removeMusic(musicId) {
    if (this.hasMusic(musicId)) {
      return delete this.musics[musicId];
    } else {
      return false;
    }
  }

  get musicIds() {
    return Object.getOwnPropertyNames(this.musics);
  }

  get encodedString() {
    return Object.getOwnPropertyNames(this.musics)
      .map((musicId) => {
        return this.getMusicDataById(musicId).encodedString;
      })
      .sort()
      .join('\n');
  }
}
