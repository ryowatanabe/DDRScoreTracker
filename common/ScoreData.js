class ScoreDetail {
  score         = null;
  scoreRank     = null;
  fullComboType = null;
  playCount     = null;
  clearCount    = null;
  maxCombo      = null;

  constructor() {
  }

  static createFromStorage(storageData) {
    const instance = new ScoreDetail();
    Object.getOwnPropertyNames(storageData).map(attributeName => {
      if(typeof(storageData[attributeName]) != 'undefined') {
        instance[attributeName] = storageData[attributeName];
      }
    });
    return instance;
  }
}

class ScoreData {
  musicId    = "";
  difficulty = {};

  constructor(musicId) {
    this.musicId = musicId;
  }

  static createFromStorage(storageData) {
    const instance = new ScoreData(storageData["musicId"]);
    Object.getOwnPropertyNames(storageData["difficulty"]).forEach(function(index){
      instance.difficulty[index] = ScoreDetail.createFromStorage(storageData["difficulty"][index]);
    });
    return instance;
  }

  applyScoreDetail(difficulty, scoreDetail) {
    /*　ToDo: データの単純上書きでなく、マージが必要なケースを考慮する */
    this.difficulty[difficulty] = scoreDetail;
  }

  getScoreDetailByDifficulty(difficultyValue) {
    return this.difficulty[difficultyValue];
  }

  hasDifficulty(difficultyValue) {
    return this.difficulty.hasOwnProperty(difficultyValue);
  }

  get difficulties(){
    return Object.getOwnPropertyNames(this.difficulty);
  }
}

class ScoreList {
  musics = {};

  constrctor() {
  }

  static createFromStorage(storageData) {
    const instance = new ScoreList();
    Object.getOwnPropertyNames(storageData).forEach(function(musicId){
      const scoreData = ScoreData.createFromStorage(storageData[musicId]);
      instance.applyScoreData(scoreData);
    });
    return instance;
  }

  applyScoreData(scoreData) {
    /*　ToDo: データの単純上書きでなく、マージが必要なケースを考慮する */
    this.musics[scoreData.musicId] = scoreData;
  }

  applyObject(object) {
    const scoreData = ScoreData.createFromStorage(object);
    if (scoreData === null) {
      return false;
    }
    this.applyScoreData(scoreData);
    return true;
  }

  getScoreDataByMusicId(musicId){
    return this.musics[musicId];
  }

  hasMusic(musicId){
    return this.musics.hasOwnProperty(musicId);
  }

  get musicIds(){
    return Object.getOwnPropertyNames(this.musics);
  }
}
