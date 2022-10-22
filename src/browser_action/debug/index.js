import { App } from '../../static/common/App.js';
import { STATE as APP_STATE, CHANGE_STATE_MESSAGE_TYPE as CHANGE_APP_STATE_MESSAGE_TYPE } from '../../static/common/AppState.js';
import { Constants } from '../../static/common/Constants.js';
import LogContainer from '../log-container.vue';

const app = new App();

function updateMusicList() {
  app.updateMusicList();
}
document.getElementById('updateMusicListButton').addEventListener('click', updateMusicList);

function refreshAllMusicInfo(gameVersion) {
  app.refreshAllMusicInfo(document.getElementById('refreshAllMusicInfoMusicId').value, gameVersion);
}
document.getElementById('refreshAllMusicInfoButton').addEventListener('click', refreshAllMusicInfo.bind(null, Constants.GAME_VERSION.A20PLUS));
document.getElementById('refreshAllMusicInfoButtonA3').addEventListener('click', refreshAllMusicInfo.bind(null, Constants.GAME_VERSION.A3));

function resetStorage() {
  if (window.confirm('端末上に保存されているデータをすべて削除しますか？')) {
    app.resetStorage();
  } else {
    alert('キャンセルしました。');
  }
}
document.getElementById('resetStorageButton').addEventListener('click', resetStorage);

function dumpMusicList() {
  const musics = app.getMusicList();
  document.getElementById('dumpMusicListArea').innerHTML = musics.encodedString;
  var copyText = document.getElementById('dumpMusicListArea');
  copyText.select();
  if (document.execCommand('copy')) {
    alert('クリップボードにコピーしました。');
  } else {
    alert('クリップボードにコピーできませんでした。');
  }
}
document.getElementById('dumpMusicListButton').addEventListener('click', dumpMusicList);

function restoreMusicList() {
  const string = document.getElementById('restoreMusicListArea').value;
  if (window.confirm('フォームの内容で楽曲リストをリストアしますか？')) {
    app.restoreMusicList(string);
    alert('リストアしました。');
  } else {
    alert('キャンセルしました。');
  }
}
document.getElementById('restoreMusicListButton').addEventListener('click', restoreMusicList);

function dumpScoreList() {
  const scoreList = app.getScoreList();
  document.getElementById('dumpScoreListArea').innerHTML = JSON.stringify(scoreList.musics);
  var copyText = document.getElementById('dumpScoreListArea');
  copyText.select();
  if (document.execCommand('copy')) {
    alert('クリップボードにコピーしました。');
  } else {
    alert('クリップボードにコピーできませんでした。');
  }
}
document.getElementById('dumpScoreListButton').addEventListener('click', dumpScoreList);

function restoreScoreList() {
  let object;
  try {
    object = JSON.parse(document.getElementById('restoreScoreListArea').value);
  } catch (error) {
    console.log(error);
    alert(error);
    return;
  }
  if (window.confirm('フォームの内容でスコアリストをリストアしますか？')) {
    app.restoreScoreList(object);
    alert('リストアしました。');
  } else {
    alert('キャンセルしました。');
  }
}
document.getElementById('restoreScoreListButton').addEventListener('click', restoreScoreList);

const logContainer = new LogContainer();
document.addEventListener('DOMContentLoaded', () => {
  logContainer.$mount('#log-container');
});

function onInitialized() {
  logContainer.initialize(app);

  if (app.getState() != APP_STATE.IDLE) {
    logContainer.disableButtons();
    logContainer.open();
  } else {
    logContainer.enableButtons();
  }
}

function initialize() {
  if (app.getState() == APP_STATE.INITIALIZE) {
    setTimeout(initialize, 100);
  } else {
    onInitialized();
  }
}

window.addEventListener('load', () => {
  initialize();
});
window.addEventListener('unload', () => {});

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.type == CHANGE_APP_STATE_MESSAGE_TYPE) {
    console.log(`change background state ${message.oldState} -> ${message.state}`);
    if (message.state == APP_STATE.IDLE) {
      logContainer.enableButtons();
    } else {
      logContainer.disableButtons();
    }
  }
});
