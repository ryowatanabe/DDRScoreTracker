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
  const names = [ "playMode", "level", "clearType", "scoreRank" ];
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

function openFilter() {
  $("#filterContainer").attr('class', 'filter active');
  $("#filterBackground").attr('class', 'filter-background active');
}
function closeFilter() {
  $("#filterContainer").attr('class', 'filter');
  $("#filterBackground").attr('class', 'filter-background');
  setTimeout(refreshList2, 300);
}

document.getElementById('openFilterButton').addEventListener("click", openFilter);
document.getElementById('closeFilterButton').addEventListener("click", closeFilter);

document.getElementById('dumpMusicListButton').addEventListener("click", dumpMusicList);
document.getElementById('updateParsedMusicListButton').addEventListener("click", updateParsedMusicList);
