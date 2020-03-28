export class MusicData {
  musicId    = "";
  title      = "";
  difficulty = [0, 0, 0, 0, 0, 0, 0, 0, 0];

  constructor(musicId, title, difficulty) {
    this.musicId    = musicId;
    this.title      = title;
    this.difficulty = difficulty;
  }

  static createFromStorage(storageData) {
    const instance = new MusicData(
      storageData["musicId"],
      storageData["title"],
      storageData["difficulty"]
    );
    return instance;
  }

  static createFromString(encodedString) {
    if(encodedString.trim() == "") {
      return null;
    }
    const elements = encodedString.split("\t");
    if (elements.length != 11) {
      LOGGER.error(`MusicData.create invalid string: ${encodedString}`);
      return null;
    }
    const instance = new MusicData(
      elements[0],
      elements[10],
      elements.slice(1, 10).map(element => parseInt(element, 10))
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
    for (let index in iterator) {
      if (this.difficulty[index] == 0 && musicData.difficulty[index] != 0){
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
    return [this.musicId, this.difficulty, this.title].flat().join("\t");
  }
}
