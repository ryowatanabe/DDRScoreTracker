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
    appCharts.charts     = chartList.charts;
    appCharts.statistics = chartList.statistics;
  });
}
