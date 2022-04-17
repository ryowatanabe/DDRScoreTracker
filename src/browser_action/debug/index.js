import { Constants } from '../../static/common/Constants.js';
import LogContainer from '../log-container.vue';
import { STATE as BACKGROUND_STATE, CHANGE_STATE_MESSAGE_TYPE as CHANGE_BACKGROUND_STATE_MESSAGE_TYPE } from '../../static/background/state.js';

function updateMusicList() {
  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    backgroundPage.updateMusicList();
  });
}
document.getElementById('updateMusicListButton').addEventListener('click', updateMusicList);

function refreshAllMusicInfo(gameVersion) {
  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    backgroundPage.refreshAllMusicInfo(document.getElementById('refreshAllMusicInfoMusicId').value, gameVersion);
  });
}
document.getElementById('refreshAllMusicInfoButton').addEventListener('click', refreshAllMusicInfo.bind(null, Constants.GAME_VERSION.A20PLUS));
document.getElementById('refreshAllMusicInfoButtonA3').addEventListener('click', refreshAllMusicInfo.bind(null, Constants.GAME_VERSION.A3));

function resetStorage() {
  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    if (window.confirm('端末上に保存されているデータをすべて削除しますか？')) {
      backgroundPage.resetStorage();
    } else {
      alert('キャンセルしました。');
    }
  });
}
document.getElementById('resetStorageButton').addEventListener('click', resetStorage);

function dumpMusicList() {
  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    const musics = backgroundPage.getMusicList();
    document.getElementById('dumpMusicListArea').innerHTML = musics.encodedString;
    var copyText = document.getElementById('dumpMusicListArea');
    copyText.select();
    if (document.execCommand('copy')) {
      alert('クリップボードにコピーしました。');
    } else {
      alert('クリップボードにコピーできませんでした。');
    }
  });
}
document.getElementById('dumpMusicListButton').addEventListener('click', dumpMusicList);

function restoreMusicList() {
  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    const string = document.getElementById('restoreMusicListArea').value;
    if (window.confirm('フォームの内容で楽曲リストをリストアしますか？')) {
      backgroundPage.restoreMusicList(string);
      alert('リストアしました。');
    } else {
      alert('キャンセルしました。');
    }
  });
}
document.getElementById('restoreMusicListButton').addEventListener('click', restoreMusicList);

function dumpScoreList() {
  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    const scoreList = backgroundPage.getScoreList();
    document.getElementById('dumpScoreListArea').innerHTML = JSON.stringify(scoreList.musics);
    var copyText = document.getElementById('dumpScoreListArea');
    copyText.select();
    if (document.execCommand('copy')) {
      alert('クリップボードにコピーしました。');
    } else {
      alert('クリップボードにコピーできませんでした。');
    }
  });
}
document.getElementById('dumpScoreListButton').addEventListener('click', dumpScoreList);

function restoreScoreList() {
  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    let object;
    try {
      object = JSON.parse(document.getElementById('restoreScoreListArea').value);
    } catch (error) {
      console.log(error);
      alert(error);
      return;
    }
    if (window.confirm('フォームの内容でスコアリストをリストアしますか？')) {
      backgroundPage.restoreScoreList(object);
      alert('リストアしました。');
    } else {
      alert('キャンセルしました。');
    }
  });
}
document.getElementById('restoreScoreListButton').addEventListener('click', restoreScoreList);

const logContainer = new LogContainer();
document.addEventListener('DOMContentLoaded', () => {
  logContainer.$mount('#log-container');
});

window.addEventListener('load', () => {
  setTimeout(() => {
    logContainer.initialize();
    chrome.runtime.getBackgroundPage(function (backgroundPage) {
      if (backgroundPage.getState() != BACKGROUND_STATE.IDLE) {
        logContainer.disableButtons();
        logContainer.open();
      } else {
        logContainer.enableButtons();
      }
    });
  }, 300);
});
window.addEventListener('unload', () => {});

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.type == CHANGE_BACKGROUND_STATE_MESSAGE_TYPE) {
    console.log(`change background state ${message.oldState} -> ${message.state}`);
    if (message.state == BACKGROUND_STATE.IDLE) {
      logContainer.enableButtons();
    } else {
      logContainer.disableButtons();
    }
  }
});
