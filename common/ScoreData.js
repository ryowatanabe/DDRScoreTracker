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
    
    return instance;
  }
}

class ScoreData {
  musicId       = "";
  score         = null;
  scoreRank     = null;
  fullComboType = null;
  playCount     = null;
  clearCount    = null;
  maxCombo      = null;

  constructor() {
  }

  static createFromStorage(musicId, storageData) {
    const instance = new ScoreData();

    return instance;
  }

}

class ScoreList {
  musics = {};

  constrctor() {
  }

  static createFromStorage(storageData) {
    const instance = new ScoreList();
    Object.keys(storageData).forEach(function(musicId){
      const scoreData = Scoreata.createFromStorage(musicId, storageData[musicId]);
      instance.applyScoreData(scoreData);
    });
    return instance;
  }
}
