function openLog() {
  $("#logContainer").attr('class', 'log active');
  scrollLogToBottom();
}
function closeLog() {
  $("#logContainer").attr('class', 'log');
}
function flushLog() {
  LOG_RECEIVER.flush();
}
let isScrollLogScheduled = false;
function scrollLogToBottom() {
  if(!isScrollLogScheduled) {
    isScrollLogScheduled = true;
    setTimeout(scrollLogToBottomImpl, 500);
  }
}
function scrollLogToBottomImpl() {
  $("#logContainer").get()[0].scrollTo(0, $("#logContainer").get()[0].scrollHeight);
  isScrollLogScheduled = false;
}

const appLog = new Vue({
  el: '#app-log',
  data: {
    log: LOG_RECEIVER.data
  }
});
LOG_RECEIVER.callback = openLog;
document.getElementById('closeLogButton').addEventListener("click", closeLog);
document.getElementById('flushLogButton').addEventListener("click", flushLog);
document.getElementById('closeLogButton2').addEventListener("click", closeLog);
document.getElementById('flushLogButton2').addEventListener("click", flushLog);
