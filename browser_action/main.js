const appCharts = new Vue({
  el: '#app-charts',
  data: {
    statistics: {
      fullComboType: {
        marvelous_fc: 0,
        perfect_fc:   0,
        great_fc:     0,
        good_fc:      0
      }
    },
    charts: []
  }
})

const appList = new Vue({
  el: '#app-list',
  data: {
    type: LIST_TYPE.MENU,
    elements: MENU_DATA
  }
})

const appLog = new Vue({
  el: '#app-log',
  data: {
    log: LOG_RECEIVER.data
  }
});

function updateMusicList()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.updateMusicList(chrome.windows.WINDOW_ID_CURRENT);
  });
}

function updateMusicList2()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.fetchMissingMusicInfo(chrome.windows.WINDOW_ID_CURRENT);
  });
}

function updateSingleScoreList()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.updateScoreList(chrome.windows.WINDOW_ID_CURRENT, PLAY_MODE.SINGLE);
  });
}
function updateDoubleScoreList()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.updateScoreList(chrome.windows.WINDOW_ID_CURRENT, PLAY_MODE.DOUBLE);
  });
}

function updateScoreDetail()
{

}

function updateCharts()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.updateCharts();
  });
}

function refreshList(){
  const conditions = eval($('#filterConditions').get()[0].value);
  refreshListImpl(conditions)
}

function refreshListImpl(conditions)
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    const allCharts = backgroundPage.getCharts();
    // filter
    let charts = allCharts.filter(chart => {
      let found = true;
      conditions.forEach(condition => {
        if(!condition.values.includes(chart[condition.attribute])){
          found = false;
        }
      });
      return found;
    });
    // sort
    // TODO ソート方法を定義できるようにする
    charts.sort(function(a, b){
      if (a.score > b.score){
        return -1;
      } else if (a.score < b.score){
        return 1;
      } else {
        if (a.title < b.title){
          return -1;
        } else if (a.title > b.title){
          return 1;
        }
      }
      return 0;
    });
    appCharts.charts = charts;
    // statistics
    appCharts.statistics['fullComboType'] = {
      marvelous_fc: charts.filter(chart => { return chart.fullComboType == FULL_COMBO_TYPE.MARVELOUS_FC }).length,
      perfect_fc:   charts.filter(chart => { return chart.fullComboType == FULL_COMBO_TYPE.PERFECT_FC }).length,
      great_fc:     charts.filter(chart => { return chart.fullComboType == FULL_COMBO_TYPE.GREAT_FC }).length,
      good_fc:      charts.filter(chart => { return chart.fullComboType == FULL_COMBO_TYPE.GOOD_FC }).length,
      clear:        charts.filter(chart => { return chart.fullComboType == FULL_COMBO_TYPE.NO_FC && chart.scoreRank > SCORE_RANK.E }).length,
      failed:       charts.filter(chart => { return chart.fullComboType == FULL_COMBO_TYPE.NO_FC && chart.scoreRank == SCORE_RANK.E }).length,
      no_play:      charts.filter(chart => { return chart.fullComboType == FULL_COMBO_TYPE.NO_FC && chart.scoreRank == SCORE_RANK.NO_PLAY }).length
    };
    appCharts.statistics['musicCount'] = charts.length;
  });
}



document.getElementById('updateMusicListButton').addEventListener("click", updateMusicList);
document.getElementById('updateMusicList2Button').addEventListener("click", updateMusicList2);
document.getElementById('updateSingleScoreListButton').addEventListener("click", updateSingleScoreList);
document.getElementById('updateDoubleScoreListButton').addEventListener("click", updateDoubleScoreList);
document.getElementById('updateScoreDetailButton').addEventListener("click", updateScoreDetail);
document.getElementById('updateChartsButton').addEventListener("click", updateCharts);
document.getElementById('refreshListButton').addEventListener("click", refreshList);
