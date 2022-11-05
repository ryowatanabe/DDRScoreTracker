<template>
  <div>
    <div id="logBackground" class="drawer-background not-initialized"></div>
    <div id="logContainer" class="drawer log not-initialized">
      <div id="scrollToBottomButton" class="drawer-switch" @click="scrollToBottom">{{ getMessage('log_container_scroll_to_bottom_button') }}</div>
      <div id="app-log" class="log-data">
        <div v-for="(line, index) in log" :key="index">{{ line }}</div>
      </div>
      <div id="closeButton" class="drawer-switch" @click="closeAndFlush">{{ getMessage('log_container_close_button') }}</div>
      <div id="copyButton" class="drawer-switch" @click="copy">{{ getMessage('log_container_copy_button') }}</div>
      <div id="abortButton" class="drawer-switch" @click="abort">{{ getMessage('log_container_abort_button') }}</div>
    </div>
  </div>
</template>

<script>
import { nextTick } from 'vue';
import { I18n } from '../static/common/I18n.js';
import { LogReceiver } from '../static/common/LogReceiver.js';

let app;

function initialize(a) {
  app = a;
  document.getElementById('logContainer').classList.remove('not-initialized');
  document.getElementById('logBackground').classList.remove('not-initialized');
  document.getElementById('logContainer').classList.add('initialized');
  document.getElementById('logBackground').classList.add('initialized');

  const options = app.getOptions();
  logReceiver.enableDebugLog = options.enableDebugLog;
  app.addMessageListener(logReceiver.getMessageListener());
}

function disableButtons() {
  document.getElementById('closeButton').style.display = 'none';
  document.getElementById('copyButton').style.display = 'none';
  document.getElementById('abortButton').style.display = 'block';
}

function enableButtons() {
  document.getElementById('closeButton').style.display = 'block';
  document.getElementById('copyButton').style.display = 'block';
  document.getElementById('abortButton').style.display = 'none';
}

function open() {
  document.getElementById('logContainer').classList.add('active');
  document.getElementById('logBackground').classList.add('active');
  scrollToBottom();
}

function closeAndFlush() {
  close();
  flush();
}

function close() {
  document.getElementById('logContainer').classList.remove('active');
  document.getElementById('logBackground').classList.remove('active');
}

function flush() {
  logReceiver.flush();
}

function abort() {
  app.abortAction();
}

function copy() {
  var log = document.getElementById('app-log');
  document.getSelection().selectAllChildren(log);
  if (document.execCommand('copy')) {
    alert(I18n.getMessage('log_container_copied_to_clipboard'));
  } else {
    alert(I18n.getMessage('log_container_could_not_copy_to_clipboard'));
  }
}

let isScrollLogScheduled = false;
function scrollToBottom() {
  if (!isScrollLogScheduled) {
    isScrollLogScheduled = true;
    setTimeout(scrollToBottomImpl, 500);
  }
}
function scrollToBottomImpl() {
  const logContainer = document.getElementById('logContainer');
  logContainer.scrollTo(0, logContainer.scrollHeight);
  isScrollLogScheduled = false;
}

const logReceiver = new LogReceiver(() => {
  nextTick(open);
});

export default {
  data: function () {
    return {
      log: logReceiver.data,
    };
  },
  methods: {
    getMessage(key) {
      return I18n.getMessage(key);
    },
    scrollToBottom() {
      scrollToBottom();
    },
    close() {
      close();
    },
    copy() {
      copy();
    },
    flush() {
      flush();
    },
    closeAndFlush() {
      closeAndFlush();
    },
    open() {
      open();
    },
    abort() {
      abort();
    },
    enableButtons() {
      enableButtons();
    },
    disableButtons() {
      disableButtons();
    },
    initialize(a) {
      initialize(a);
    },
  },
};
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
