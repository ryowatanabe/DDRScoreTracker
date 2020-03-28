function updateMusicList()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.updateMusicList(chrome.windows.WINDOW_ID_CURRENT);
  });
}
document.getElementById('updateMusicListButton').addEventListener("click", updateMusicList);

function updateCharts()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.updateCharts();
  });
}
document.getElementById('updateChartsButton').addEventListener("click", updateCharts);

function resetStorage()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.resetStorage();
  });
}
document.getElementById('resetStorageButton').addEventListener("click", resetStorage);

function dumpMusicList() {
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    const musics = backgroundPage.getMusicList();
    $('#dumpMusicListArea').get()[0].innerHTML = musics.encodedString;
    var copyText = document.querySelector("#dumpMusicListArea");
    copyText.select();
    if(document.execCommand("copy")){
      alert('クリップボードにコピーしました。');
    } else{
      alert('クリップボードにコピーできませんでした。');
    }
  });
}
document.getElementById('dumpMusicListButton').addEventListener("click", dumpMusicList);

function dumpScoreList() {
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    const scoreList = backgroundPage.getScoreList();
    $('#dumpScoreListArea').get()[0].innerHTML = JSON.stringify(scoreList.musics);
    var copyText = document.querySelector("#dumpScoreListArea");
    copyText.select();
    if(document.execCommand("copy")){
      alert('クリップボードにコピーしました。');
    } else{
      alert('クリップボードにコピーできませんでした。');
    }
  });
}
document.getElementById('dumpScoreListButton').addEventListener("click", dumpScoreList);

function restoreScoreList() {
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    try {
      const object = JSON.parse($('#restoreScoreListArea').get()[0].value);
    } catch (error) {
      console.log(error);
      alert(error);
      return;
    }
    if (window.confirm('フォームの内容でスコアリストをリストアしますか？')) {
      backgroundPage.restoreScoreList(object);
      alert("リストアしました。");
    } else{
      alert("キャンセルしました。");
    }
  });
}
document.getElementById('restoreScoreListButton').addEventListener("click", restoreScoreList);
