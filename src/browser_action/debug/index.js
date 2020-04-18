import LogContainer from '../log-container.vue';

function updateMusicList() {
  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    backgroundPage.updateMusicList(chrome.windows.WINDOW_ID_CURRENT);
  });
}
document.getElementById('updateMusicListButton').addEventListener('click', updateMusicList);

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

document.addEventListener('DOMContentLoaded', () => {
  const logContainer = new LogContainer();
  logContainer.$mount('#log-container');
});
