class ScoreDetail {
  score      = null;
  scoreRank  = null;
  clearType  = null;
  playCount  = null;
  clearCount = null;
  maxCombo   = null;

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

  get actualClearType() {
    if (this.clearType === null){
      /* 可能な範囲でクリアタイプを自動判定する */
      if (this.score === null || this.scoreRank === null) {
        return CLEAR_TYPE.NO_PLAY;
      }
      if (this.clearCount === null) {
        switch (this.scoreRank) {
          case SCORE_RANK.NO_PLAY:
            return CLEAR_TYPE.NO_PLAY;
            break;
          case SCORE_RANK.E:
            return CLEAR_TYPE.FAILED;
            break;
          default:
            return CLEAR_TYPE.CLEAR;
            break;
        }
      } else if (this.clearCount == 0) {
        if (this.scoreRank > SCORE_RANK.E) {
          return CLEAR_TYPE.ASSIST_CLEAR;
        }
      }
      return CLEAR_TYPE.CLEAR;
    }
    return this.clearType;
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
