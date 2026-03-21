import '../styles/tailwind.css';
import { createApp } from 'vue';
import { App } from '../static/common/App.js';
import { STATE as APP_STATE, CHANGE_STATE_MESSAGE_TYPE as CHANGE_APP_STATE_MESSAGE_TYPE } from '../static/common/AppState.js';
import { Logger } from '../static/common/Logger.js';
import ChartList from './chart-list.vue';
import ChartDiffList from './chart-diff-list.vue';
import LogContainer from './log-container.vue';

import { initialize as initializeFilter } from './filter.js';
import { initialize as initializeMenu } from './menu.js';

const app = new App();

let chartList: InstanceType<typeof ChartList>;
let chartDiffList: InstanceType<typeof ChartDiffList>;
let logContainer: InstanceType<typeof LogContainer>;

document.addEventListener('DOMContentLoaded', () => {
  chartList = createApp(ChartList).mount('#chart-list') as InstanceType<typeof ChartList>;
  chartDiffList = createApp(ChartDiffList).mount('#chart-diff-list') as InstanceType<typeof ChartDiffList>;
  logContainer = createApp(LogContainer).mount('#log-container') as InstanceType<typeof LogContainer>;
});

function onInitialized() {
  chartDiffList.initialize(app);
  logContainer.initialize(app);

  document.addEventListener('open-diff', () => {
    chartDiffList.loadAndOpen();
  });

  document.addEventListener('refresh-chart-list', async (event) => {
    const { summarySettings, filterConditions, sortConditions } = (event as CustomEvent).detail;
    const internalStatus = app.getInternalStatus();
    const options = app.getOptions();
    if ((options!['musicListReloadInterval'] as number) > 0 && (internalStatus!['musicListUpdatedAt'] as number) + (options!['musicListReloadInterval'] as number) < Date.now()) {
      try {
        await app.fetchParsedMusicList();
      } catch (error) {
        Logger.debug(error);
      }
    }
    const newChartList = app.getChartList().getFilteredAndSorted(filterConditions, sortConditions);
    chartList.summarySettings = summarySettings;
    chartList.setData(newChartList);
  });

  initializeFilter(app);
  initializeMenu(app, chartList);

  if (app.getState() !== APP_STATE.IDLE) {
    logContainer.disableButtons();
    logContainer.open();
  } else {
    logContainer.enableButtons();
  }

  app.addMessageListener((message) => {
    if (message.type === CHANGE_APP_STATE_MESSAGE_TYPE) {
      Logger.debug(`change app state ${message.oldState} -> ${message.state}`);
      if (message.state === APP_STATE.IDLE) {
        logContainer.enableButtons();
        if (message.oldState === APP_STATE.UPDATE_SCORE_LIST) {
          chartDiffList.loadAndOpen();
        }
      } else {
        logContainer.disableButtons();
      }
    }
  });
}

window.addEventListener('load', () => {
  const extension_id = chrome.i18n.getMessage('@@extension_id');
  // 二重起動抑止
  chrome.tabs.query({ url: `chrome-extension://${extension_id}/browser_action/*` }, async (tabs) => {
    if (tabs.length > 1) {
      window.close();
    } else {
      await app.init();
      onInitialized();
    }
  });
});
window.addEventListener('unload', () => {});
