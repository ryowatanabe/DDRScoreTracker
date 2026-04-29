import { Constants, type MusicType, type MusicVersion } from './Constants.js';
import { Logger } from './Logger.js';

export class MusicData {
  musicId: string;
  type: MusicType;
  title: string;
  difficulty: number[];
  isDeleted: number;
  containedVersion: MusicVersion;

  constructor(musicId: string, type: MusicType, title: string, difficulty: number[], isDeleted: number, containedVersion: MusicVersion = null) {
    this.musicId = musicId;
    this.type = type;
    this.title = title;
    this.difficulty = difficulty;
    this.isDeleted = isDeleted;
    this.containedVersion = containedVersion;
  }

  static createEmptyData(musicId: string, musicType: MusicType): MusicData {
    return new MusicData(musicId, musicType, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0, null);
  }

  static createFromStorage(storageData: Record<string, unknown>): MusicData {
    const instance = new MusicData(
      storageData['musicId'] as string,
      storageData['type'] as MusicType,
      storageData['title'] as string,
      storageData['difficulty'] as number[],
      storageData['isDeleted'] as number,
      (storageData['containedVersion'] as MusicVersion) ?? null
    );
    return instance;
  }

  static createFromString(encodedString: string): MusicData | null {
    if (encodedString.trim() === '') {
      return null;
    }
    const elements = encodedString.split('\t');
    const MUSIC_ID_INDEX = 0;
    const TYPE_INDEX = 1;
    const IS_DELETED_INDEX = 2;
    const DIFFICULTY_START_INDEX = 3;
    const DIFFICULTY_END_INDEX = 12;
    const CONTAINED_VERSION_INDEX = 12;
    const TITLE_INDEX = 13;
    if (elements.length !== 13 && elements.length !== 14) {
      Logger.error(`MusicData.create invalid string: ${encodedString}`);
      return null;
    }
    // 13要素は旧形式: [12]=title, containedVersion なし
    // 14要素は新形式: [12]=containedVersion, [13]=title
    let title: string;
    let containedVersion: MusicVersion = null;
    if (elements.length === 13) {
      title = elements[DIFFICULTY_END_INDEX];
    } else {
      title = elements[TITLE_INDEX];
      if (elements[CONTAINED_VERSION_INDEX] !== '') {
        containedVersion = parseInt(elements[CONTAINED_VERSION_INDEX], 10) as MusicVersion;
      }
    }
    const instance = new MusicData(
      elements[MUSIC_ID_INDEX],
      parseInt(elements[TYPE_INDEX], 10) as MusicType,
      title,
      elements.slice(DIFFICULTY_START_INDEX, DIFFICULTY_END_INDEX).map((element) => parseInt(element, 10)),
      parseInt(elements[IS_DELETED_INDEX], 10),
      containedVersion
    );
    return instance;
  }

  /*
  引数に与えられたmusicDataの方により新しいデータがあればこのオブジェクトに反映
  更新が発生した場合 true, そうでない場合 false を返す
  */
  merge(musicData: MusicData): boolean {
    if (this.musicId !== musicData.musicId) {
      throw new Error(`musicId mismatch: ${this.musicId}, ${musicData.musicId}`);
    }
    const iterator = this.difficulty.keys();
    let isUpdated = false;
    for (const index of iterator) {
      if (musicData.difficulty[index] !== 0 && this.difficulty[index] !== musicData.difficulty[index]) {
        isUpdated = true;
        this.difficulty[index] = musicData.difficulty[index];
      }
    }
    if (musicData.type !== Constants.MUSIC_TYPE.UNKNOWN && this.type !== musicData.type) {
      isUpdated = true;
      this.type = musicData.type;
    }
    if (musicData.title !== '' && this.title !== musicData.title) {
      isUpdated = true;
      this.title = musicData.title;
    }
    if (musicData.isDeleted !== 0 && this.isDeleted !== musicData.isDeleted) {
      isUpdated = true;
      this.isDeleted = musicData.isDeleted;
    }
    if (musicData.containedVersion !== null && this.containedVersion !== musicData.containedVersion) {
      isUpdated = true;
      this.containedVersion = musicData.containedVersion;
    }
    return isUpdated;
  }

  getLevel(index: number): number {
    return this.difficulty[index];
  }

  hasDifficulty(index: number): boolean {
    return this.difficulty[index] !== 0;
  }

  get encodedString(): string {
    const containedVersionStr = this.containedVersion !== null ? String(this.containedVersion) : '';
    return [this.musicId, this.type, this.isDeleted, this.difficulty, containedVersionStr, this.title].flat().join('\t');
  }
}
