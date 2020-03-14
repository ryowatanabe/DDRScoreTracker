class MusicData {
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
    const elements = encodedString.split("\t");
    if (elements.length != 11) {
      LOGGER.error(`MusicData.create invalid string: ${encodedString}`);
      return null;
    }
    const instance = new MusicData(
      elements[0],
      elements.slice(1, 10).map(element => parseInt(element, 10)),
      elements[10]
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

  get encodedString() {
    return [this.musicId, this.difficulty, this.title].flat().join("\t");
  }
}

class MusicList {
  musics = {};

  constrctor() {
  }

  static createFromStorage(storageData) {
    const instance = new MusicList();
    Object.getOwnPropertyNames(storageData).forEach(function(musicId){
      const musicData = MusicData.createFromStorage(storageData[musicId]);
      instance.applyMusicData(musicData);
    });
    return instance;
  }

  applyMusicData(musicData) {
    if (this.hasMusic(musicData.musicId)) {
      if (this.getById(musicData.musicId).merge(musicData)) {
        LOGGER.debug(`Modified: ${this.getById(musicData.musicId).encodedString}`);
      }
    } else{
      LOGGER.debug(`Added: ${musicData.encodedString}`);
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

  getById(musicId){
    return this.musics[musicId];
  }

  hasMusic(musicId){
    return this.musics.hasOwnProperty(musicId);
  }

  get encodedString(){
    return Object.getOwnPropertyNames(this.musics).map(musicId => {
      return this.getById(musicId).encodedString;
    }).sort().join("\n");
  }
}
