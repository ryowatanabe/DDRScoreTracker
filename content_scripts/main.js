//document.addEventListener("DOMContentLoaded", function(event) {
  console.log("DOM fully loaded and parsed");
  chrome.runtime.onMessage.addListener(function (message,sender,sendResponse) {
    if (message.type == 'RETRIEVE_MUSIC_LIST') {
      console.log("retrieve music list");
      sendResponse({ hoge: 1 });
      return true;
    }
    if (message.type == 'RETRIEVE_MUSIC_SCORE') {
      console.log("retrieve music score");
      sendResponse({ foo: 1 });
      return true;
    }
  });
//});

console.log ("content script ready");
