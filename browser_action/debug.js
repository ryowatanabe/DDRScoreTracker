function dumpMusicList()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    const musics = backgroundPage.getMusics();
    const encodedMusicList = Object.keys(musics).map(musicId => {
      return [musicId, musics[musicId].difficulty, musics[musicId].title].flat().join("\t")
    }).sort().join("\n");

    $('#textarea').get()[0].innerHTML = encodedMusicList;
    var copyText = document.querySelector("#textarea");
    copyText.select();
    if(document.execCommand("copy")){
      alert('クリップボードにコピーしました。');
    } else{
      alert('クリップボードにコピーできませんでした。');
    }
  });
}

function updateParsedMusicList()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.updateParsedMusicList();
  });
}

document.getElementById('dumpMusicListButton').addEventListener("click", dumpMusicList);
document.getElementById('updateParsedMusicListButton').addEventListener("click", updateParsedMusicList);
