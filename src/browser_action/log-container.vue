<template>
  <div>
    <div id="logBackground" class="drawer-background not-initialized"></div>
    <div id="logContainer" class="drawer log not-initialized">
      <div id="scrollLogToBottomButton" class="drawer-switch" v-on:click="scrollToBottom">{{ getMessage('log_container_scroll_to_bottom_button') }}</div>
      <div id="app-log" class="log-data">
        <template v-for="line in log"> {{ line }} <br /> </template>
      </div>
      <div id="closeLogButton" class="drawer-switch" v-on:click="closeAndFlush">{{ getMessage('log_container_close_button') }}</div>
      <div id="copyLogButton" class="drawer-switch" v-on:click="copy">{{ getMessage('log_container_copy_button') }}</div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { I18n } from '../static/common/I18n.js';
import { LogReceiver } from '../static/common/LogReceiver.js';

function initialize() {
  document.getElementById('logContainer').classList.remove('not-initialized');
  document.getElementById('logBackground').classList.remove('not-initialized');
  document.getElementById('logContainer').classList.add('initialized');
  document.getElementById('logBackground').classList.add('initialized');
}

function disableButtons() {
  document.getElementById('closeLogButton').style.display = 'none';
  document.getElementById('copyLogButton').style.display = 'none';
}

function enableButtons() {
  document.getElementById('closeLogButton').style.display = 'block';
  document.getElementById('copyLogButton').style.display = 'block';
}

function openLog() {
  document.getElementById('logContainer').classList.add('active');
  document.getElementById('logBackground').classList.add('active');
  scrollLogToBottom();
}

function closeAndFlush() {
  closeLog();
  flushLog();
}

function closeLog() {
  document.getElementById('logContainer').classList.remove('active');
  document.getElementById('logBackground').classList.remove('active');
}

function flushLog() {
  logReceiver.flush();
}

function copyLog() {
  var log = document.getElementById('app-log');
  document.getSelection().selectAllChildren(log);
  if (document.execCommand('copy')) {
    alert(I18n.getMessage('log_container_copied_to_clipboard'));
  } else {
    alert(I18n.getMessage('log_container_could_not_copy_to_clipboard'));
  }
}

let isScrollLogScheduled = false;
function scrollLogToBottom() {
  if (!isScrollLogScheduled) {
    isScrollLogScheduled = true;
    setTimeout(scrollLogToBottomImpl, 500);
  }
}
function scrollLogToBottomImpl() {
  const logContainer = document.getElementById('logContainer');
  logContainer.scrollTo(0, logContainer.scrollHeight);
  isScrollLogScheduled = false;
}

const logReceiver = new LogReceiver(() => {
  Vue.nextTick(openLog);
});
chrome.runtime.getBackgroundPage(function (backgroundPage) {
  const options = backgroundPage.getOptions();
  logReceiver.enableDebugLog = options.enableDebugLog;
});

export default Vue.extend({
  data: function () {
    return {
      log: logReceiver.data,
    };
  },
  methods: {
    getMessage: I18n.getMessage,
    scrollToBottom: () => {
      scrollLogToBottom();
    },
    close: () => {
      closeLog();
    },
    copy: () => {
      copyLog();
    },
    flush: () => {
      flushLog();
    },
    closeAndFlush: () => {
      closeAndFlush();
    },
    open: () => {
      openLog();
    },
    enableButtons: () => {
      enableButtons();
    },
    disableButtons: () => {
      disableButtons();
    },
    initialize: () => {
      initialize();
    },
  },
});
</script>

<style scoped>
.log {
  height: 100%;
  overflow: scroll;
}
.log-data {
  clear: right;
}
</style>
<style src="../static/browser_action/drawer.css" scoped></style>
