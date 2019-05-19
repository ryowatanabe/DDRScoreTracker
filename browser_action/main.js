function retrieve()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.retrieve(chrome.windows.WINDOW_ID_CURRENT);
  });
}

document.getElementById('updateMusicListButton').addEventListener("click", retrieve);
