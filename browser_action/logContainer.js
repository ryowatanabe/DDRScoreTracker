function openLog() {
  $("#logContainer").addClass('active');
  $("#logBackground").addClass('active');
  scrollLogToBottom();
}
function closeLog() {
  $("#logContainer").removeClass('active');
  $("#logBackground").removeClass('active');
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
document.getElementById('scrollLogToBottomButton').addEventListener("click", scrollLogToBottomImpl);
