import { MusicData } from './MusicData.js';
import { Logger } from './Logger.js';

export class MusicList {
  musics: Record<string, MusicData>;

  constructor() {
    this.musics = {};
  }

  static createFromStorage(storageData: Record<string, unknown>): MusicList {
    const instance = new MusicList();
    Object.getOwnPropertyNames(storageData).forEach((musicId) => {
      const musicData = MusicData.createFromStorage(storageData[musicId] as Record<string, unknown>);
      instance.applyMusicData(musicData);
    });
    return instance;
  }

  /*
  更新があればtrue, なければfalseを返す
  */
  applyMusicData(musicData: MusicData): boolean {
    if (musicData.isDeleted === 2) {
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

  applyObject(object: Record<string, unknown>): boolean {
    const musicData = MusicData.createFromStorage(object);
    if (musicData === null) {
      return false;
    }
    return this.applyMusicData(musicData);
  }

  applyEncodedString(encodedString: string): boolean {
    const musicData = MusicData.createFromString(encodedString);
    if (musicData === null) {
      return false;
    }
    return this.applyMusicData(musicData);
  }

  getMusicDataById(musicId: string): MusicData {
    return this.musics[musicId];
  }

  hasMusic(musicId: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.musics, musicId);
  }

  removeMusic(musicId: string): boolean {
    if (this.hasMusic(musicId)) {
      return delete this.musics[musicId];
    } else {
      return false;
    }
  }

  get musicIds(): string[] {
    return Object.getOwnPropertyNames(this.musics);
  }

  toStorageData(): Record<string, MusicData> {
    return this.musics;
  }

  get encodedString(): string {
    return Object.getOwnPropertyNames(this.musics)
      .map((musicId) => {
        return this.getMusicDataById(musicId).encodedString;
      })
      .sort()
      .join('\n');
  }
}
