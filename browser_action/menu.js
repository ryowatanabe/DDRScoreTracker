function fetchParsedMusicList()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.fetchParsedMusicList();
  });
}
document.getElementById('fetchParsedMusicListButton').addEventListener("click", fetchParsedMusicList);

function fetchMissingMusicInfo()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.fetchMissingMusicInfo(chrome.windows.WINDOW_ID_CURRENT);
  });
}
document.getElementById('fetchMissingMusicInfoButton').addEventListener("click", fetchMissingMusicInfo);

function updateSingleScoreList()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.updateScoreList(chrome.windows.WINDOW_ID_CURRENT, PLAY_MODE.SINGLE);
  });
}
document.getElementById('updateSingleScoreListButton').addEventListener("click", updateSingleScoreList);

function updateDoubleScoreList()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.updateScoreList(chrome.windows.WINDOW_ID_CURRENT, PLAY_MODE.DOUBLE);
  });
}
document.getElementById('updateDoubleScoreListButton').addEventListener("click", updateDoubleScoreList);

function updateScoreDetail()
{
  const targetMusics = [];
  appCharts.charts.forEach(function(chartData){
    targetMusics.push({
      musicId: chartData.musicId,
      difficulty: chartData.difficulty + (chartData.playMode == PLAY_MODE.DOUBLE ? DIFFICULTIES_OFFSET_FOR_DOUBLE : 0)
    });
  });
  closeFilter();
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.updateScoreDetail(chrome.windows.WINDOW_ID_CURRENT, targetMusics);
  });
}
document.getElementById('updateScoreDetailButton').addEventListener("click", updateScoreDetail);

function openMenu() {
  $("#menuContainer").addClass('active');
  $("#drawerBackground").addClass('active');
}
function closeMenu() {
  $("#menuContainer").removeClass('active');
  $("#drawerBackground").removeClass('active');
}
document.getElementById('openMenuButton').addEventListener("click", openMenu);
document.getElementById('closeMenuButton').addEventListener("click", closeMenu);
