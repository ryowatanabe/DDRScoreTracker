<template>
  <div>
    <div id="logBackground" class="drawer-background not-initialized"></div>
    <div id="logContainer" class="drawer log not-initialized">
      <div id="scrollLogToBottomButton" class="drawer-switch" v-on:click="scrollToBottom">▼最新</div>
      <div id="app-log" class="log-data">
        <template v-for="line in log"> {{ line }} <br /> </template>
      </div>
      <div id="closeLogButton" class="drawer-switch" v-on:click="close">■閉じる</div>
      <div id="flushLogButton" class="drawer-switch" v-on:click="flush">■クリア</div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { LogReceiver } from '../static/common/LogReceiver.js';

function initialize() {
  document.getElementById('logContainer').classList.remove('not-initialized');
  document.getElementById('logBackground').classList.remove('not-initialized');
  document.getElementById('logContainer').classList.add('initialized');
  document.getElementById('logBackground').classList.add('initialized');
}

function openLog() {
  document.getElementById('logContainer').classList.add('active');
  document.getElementById('logBackground').classList.add('active');
  scrollLogToBottom();
}

function closeLog() {
  document.getElementById('logContainer').classList.remove('active');
  document.getElementById('logBackground').classList.remove('active');
}

function flushLog() {
  logReceiver.flush();
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
export default Vue.extend({
  data: function () {
    return {
      log: logReceiver.data,
    };
  },
  methods: {
    scrollToBottom: () => {
      scrollLogToBottom();
    },
    close: () => {
      closeLog();
    },
    flush: () => {
      flushLog();
    },
    open: () => {
      openLog();
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
