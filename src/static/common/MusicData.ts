import { Constants, type MusicType } from './Constants.js';
import { Logger } from './Logger.js';

export class MusicData {
  musicId: string;
  type: MusicType;
  title: string;
  difficulty: number[];
  isDeleted: number;

  constructor(musicId: string, type: MusicType, title: string, difficulty: number[], isDeleted: number) {
    this.musicId = musicId;
    this.type = type;
    this.title = title;
    this.difficulty = difficulty;
    this.isDeleted = isDeleted;
  }

  static createEmptyData(musicId: string, musicType: MusicType): MusicData {
    return new MusicData(musicId, musicType, '', [0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  }

  static createFromStorage(storageData: Record<string, unknown>): MusicData {
    const instance = new MusicData(
      storageData['musicId'] as string,
      storageData['type'] as MusicType,
      storageData['title'] as string,
      storageData['difficulty'] as number[],
      storageData['isDeleted'] as number
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
    const TITLE_INDEX = 12;
    const ELEMENT_COUNT = 13;
    if (elements.length !== ELEMENT_COUNT) {
      Logger.error(`MusicData.create invalid string: ${encodedString}`);
      return null;
    }
    const instance = new MusicData(
      elements[MUSIC_ID_INDEX],
      parseInt(elements[TYPE_INDEX], 10) as MusicType,
      elements[TITLE_INDEX],
      elements.slice(DIFFICULTY_START_INDEX, DIFFICULTY_END_INDEX).map((element) => parseInt(element, 10)),
      parseInt(elements[IS_DELETED_INDEX], 10)
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
    if (this.isDeleted !== musicData.isDeleted) {
      isUpdated = true;
      this.isDeleted = musicData.isDeleted;
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
    return [this.musicId, this.type, this.isDeleted, this.difficulty, this.title].flat().join('\t');
  }
}
