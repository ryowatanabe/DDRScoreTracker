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

function refreshList2() {
  var conditions = [];
  const names = [ "playMode", "level" ];
  names.forEach(function(name){
    const elements = $(`input[name=${name}]:checked`);
    if (elements.length > 0){
      const condition = {
        attribute: name,
        values: jQuery.map(elements, function(element){ return parseInt(element.value, 10); })
      }
      conditions.push(condition);
    }
  });
  console.log(conditions);
  refreshListImpl(conditions);
}

document.getElementById('refreshList2Button').addEventListener("click", refreshList2);
document.getElementById('dumpMusicListButton').addEventListener("click", dumpMusicList);
document.getElementById('updateParsedMusicListButton').addEventListener("click", updateParsedMusicList);
