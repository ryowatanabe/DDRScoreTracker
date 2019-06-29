var appCharts = new Vue({
  el: '#app-charts',
  data: {
    charts: [
      {
        mId: "0000000000000000",
        difficulty: 0,
        status: 0,
        score: 0,
        combo: 0,
        playCount: 0,
        clearCount: 0
      }
    ]
  }
})

var appLog = new Vue({
  el: '#app-log',
  data: {
    log: []
  }
})

appLog.log.push("Initialized.");
appCharts.charts.push({
  mId: "0000000000000000",
  difficulty: 0,
  status: 0,
  score: 0,
  combo: 0,
  playCount: 0,
  clearCount: 0
});


function updateMusicList()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.updateMusicList(chrome.windows.WINDOW_ID_CURRENT);
  });
}

function updateScoreList()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.updateScoreList(chrome.windows.WINDOW_ID_CURRENT, 'DP');
  });
}

function updateScoreDetail()
{

}

document.getElementById('updateMusicListButton').addEventListener("click", updateMusicList);
document.getElementById('updateScoreListButton').addEventListener("click", updateScoreList);
document.getElementById('updateScoreDetailButton').addEventListener("click", updateScoreDetail);

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("received message");
  console.log(message);
  sendResponse({ hoge: 1 });
  return true;
});
