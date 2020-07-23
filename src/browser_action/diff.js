import { Constants } from '../static/common/Constants.js';
import ChartDiffList from './chart-diff-list.vue';

const chartDiffList = new ChartDiffList();

document.addEventListener('DOMContentLoaded', () => {
  chartDiffList.$mount('#chart-list');
});

window.addEventListener('load', () => {
  chrome.runtime.getBackgroundPage(async function (backgroundPage) {
    const differences = backgroundPage.getDifferences();
    const sortConditions = [
      { attribute: 'playMode', order: 'asc' },
      { attribute: 'level', order: 'desc' },
      { attribute: 'afterScore', order: 'desc' },
      { attribute: 'beforeScore', order: 'desc' },
      { attribute: 'title', order: 'asc' },
    ];
    differences.sort(function (a, b) {
      return compareScoreDiff(a, b, sortConditions);
    });
    chartDiffList.setData(differences);
  });
});
window.addEventListener('unload', () => {});

function compareScoreDiff(a, b, sortConditions) {
  if (sortConditions.length == 0) {
    return 0;
  }
  const attribute = sortConditions[0].attribute;
  let lt = -1;
  let gt = 1;
  if (sortConditions[0].order == 'desc') {
    lt = 1;
    gt = -1;
  }
  if (a[attribute] === b[attribute]) {
    return compareScoreDiff(a, b, sortConditions.slice(1));
  }
  if (a[attribute] < b[attribute] || a[attribute] === null) {
    return lt;
  }
  return gt;
}
