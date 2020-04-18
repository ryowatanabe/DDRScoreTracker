<template>
  <div id="logContainer" class="drawer log">
    <div id="scrollLogToBottomButton" class="drawer-switch" v-on:click="scrollToBottom">▼最新</div>
    <div id="app-log" class="log-data">
      <template v-for="line in log"> {{ line }} <br /> </template>
    </div>
    <div id="closeLogButton" class="drawer-switch" v-on:click="close">■閉じる</div>
    <div id="flushLogButton" class="drawer-switch" v-on:click="flush">■クリア</div>
  </div>
</template>

<script>
import Vue from 'vue';
import { LogReceiver } from './LogReceiver.js';

function openLog() {
  $('#logContainer').addClass('active');
  $('#logBackground').addClass('active');
  scrollLogToBottom();
}
function closeLog() {
  $('#logContainer').removeClass('active');
  $('#logBackground').removeClass('active');
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
  $('#logContainer').get()[0].scrollTo(0, $('#logContainer').get()[0].scrollHeight);
  isScrollLogScheduled = false;
}

const logReceiver = new LogReceiver(openLog);
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
  },
});
</script>
