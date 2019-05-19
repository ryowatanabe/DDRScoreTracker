function retrieve(windowId)
{
  chrome.tabs.query({ windowId: windowId, index: 0 /* active: true */ }, function(tabs) {
    console.log(tabs);
    console.log(tabs[0].title);
    chrome.tabs.update(tabs[0].id, { url: "https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_double.html?offset=0&filter=0&filtertype=0&sorttype=0" }, function(tab){
      console.log('loaded');
    });
  });
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
  console.log(tabId);
  console.log(changeInfo);
  chrome.tabs.sendMessage(tabId, { type: 'RETRIEVE_MUSIC_LIST' }, function(res) { console.log(res); } );
});
