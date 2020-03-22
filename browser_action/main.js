const appCharts = new Vue({
  el: '#app-charts',
  data: {
    statistics: {
    },
    charts: []
  }
})

function refreshListDebug(){
  const conditions = eval($('#filterConditions').get()[0].value);
  refreshListImpl(conditions)
}

function refreshListImpl(filterConditions)
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    const chartList = backgroundPage.getChartList().getFilteredAndSorted(filterConditions);
    appCharts.statistics = chartList.statistics;
    appCharts.charts     = chartList.charts;
  });
}

function updateScoreDetail()
{
  const targetMusics = [];
  appCharts.charts.forEach(function(chartData){
    targetMusics.push({
      musicId: chartData.musicId,
      difficulty: chartData.difficulty + (chartData.playMode == PLAY_MODE.DOUBLE ? DIFFICULTIES_OFFSET_FOR_DOUBLE : 0)
    });
  });
  closeFilter();
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.updateScoreDetail(chrome.windows.WINDOW_ID_CURRENT, targetMusics);
  });
}

document.getElementById('updateScoreDetailButton').addEventListener("click", updateScoreDetail);
