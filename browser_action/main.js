

function updateMusicList()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.updateMusicList(chrome.windows.WINDOW_ID_CURRENT);
  });
}

function updateScoreList()
{

}

function updateScoreDetail()
{

}

document.getElementById('updateMusicListButton').addEventListener("click", updateMusicList);
document.getElementById('updateScoreListButton').addEventListener("click", updateScoreList);
document.getElementById('updateScoreDetailButton').addEventListener("click", updateScoreDetail);
