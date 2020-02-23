function refreshList() {
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
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.saveFilterConditions(conditions);
  });
  refreshListImpl(conditions);
}

function openFilter() {
  $("#filterContainer").attr('class', 'filter active');
  $("#filterBackground").attr('class', 'filter-background active');
}
function closeFilter() {
  $("#filterContainer").attr('class', 'filter');
  $("#filterBackground").attr('class', 'filter-background');
  setTimeout(refreshList, 300);
}

document.getElementById('openFilterButton').addEventListener("click", openFilter);
document.getElementById('closeFilterButton').addEventListener("click", closeFilter);

(function()
{
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    const filterConditions = backgroundPage.getFilterConditions();
    filterConditions.forEach(function(condition){
      condition.values.forEach(function(value){
        $(`#filterCondition_${condition.attribute}_${value}`).prop('checked', true);
      });
    });
    refreshList();
  });
})();
