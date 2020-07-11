import { Constants } from '../static/common/Constants.js';
import ChartDiffList from './chart-diff-list.vue';

const chartDiffList = new ChartDiffList();

document.addEventListener('DOMContentLoaded', () => {
  chartDiffList.$mount('#chart-list');
});

window.addEventListener('load', () => {
  chrome.runtime.getBackgroundPage(async function (backgroundPage) {
    const differences = backgroundPage.getDifferences();
    chartDiffList.differences = differences;
  });
});
window.addEventListener('unload', () => {});
