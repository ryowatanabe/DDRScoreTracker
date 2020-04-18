import { Constants } from '../common/Constants.js';

const appCharts = new Vue({
  el: '#app-charts',
  data: {
    maxPage: 1,
    currentPage: 1,
    statistics: {},
    pageCharts: [],
    charts: [],
  },
  methods: {
    gotoPage: function (page) {
      gotoPage(page);
    },
  },
});

function gotoPage(page) {
  appCharts.pageCharts = appCharts.charts.slice((page - 1) * Constants.PAGE_LENGTH, page * Constants.PAGE_LENGTH);
  appCharts.currentPage = page;
}

export function getCharts() {
  return appCharts.charts;
}

export function refreshList(filterConditions, sortConditions) {
  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    const chartList = backgroundPage.getChartList().getFilteredAndSorted(filterConditions, sortConditions);
    appCharts.statistics = chartList.statistics;
    appCharts.charts = chartList.charts;
    appCharts.maxPage = Math.ceil(chartList.charts.length / Constants.PAGE_LENGTH);
    appCharts.currentPage = 1;
    gotoPage(appCharts.currentPage);
  });
}
