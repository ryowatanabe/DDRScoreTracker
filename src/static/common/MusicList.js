import { MusicData } from './MusicData.js';
import { Logger } from './Logger.js';

export class MusicList {
  musics = {};

  constrctor() {}

  static createFromStorage(storageData) {
    const instance = new MusicList();
    Object.getOwnPropertyNames(storageData).forEach(function (musicId) {
      const musicData = MusicData.createFromStorage(storageData[musicId]);
      instance.applyMusicData(musicData);
    });
    return instance;
  }

  applyMusicData(musicData) {
    if (this.hasMusic(musicData.musicId)) {
      if (this.getMusicDataById(musicData.musicId).merge(musicData)) {
        Logger.info(`Modified: ${this.getMusicDataById(musicData.musicId).encodedString}`);
      }
    } else {
      Logger.info(`Added: ${musicData.encodedString}`);
      this.musics[musicData.musicId] = musicData;
    }
  }

  applyObject(object) {
    const musicData = MusicData.createFromStorage(object);
    if (musicData === null) {
      return false;
    }
    this.applyMusicData(musicData);
    return true;
  }

  applyEncodedString(encodedString) {
    const musicData = MusicData.createFromString(encodedString);
    if (musicData === null) {
      return false;
    }
    this.applyMusicData(musicData);
    return true;
  }

  getMusicDataById(musicId) {
    return this.musics[musicId];
  }

  hasMusic(musicId) {
    return this.musics.hasOwnProperty(musicId);
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
