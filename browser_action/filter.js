function refreshList() {
  var filterConditions = [];
  const names = [ "playMode", "difficulty", "level", "clearType", "scoreRank" ];
  names.forEach(function(name){
    const elements = $(`input[name=${name}]:checked`);
    if (elements.length > 0){
      const condition = {
        attribute: name,
        values: jQuery.map(elements, function(element){ return parseInt(element.value, 10); })
      }
      filterConditions.push(condition);
    }
  });

  var sortConditions = [ { attribute: "score", order: "desc" } ];
  //$(`input[name=sortCondition]:checked`).get()

  sortConditions.push({ attribute: "title", order: "asc" });
  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.saveFilterConditions(filterConditions, sortConditions);
  });
  refreshListImpl(filterConditions, sortConditions);
}

function openFilter() {
  $("#filterContainer").addClass('active');
  $("#drawerBackground").addClass('active');
}
function closeFilter() {
  $("#filterContainer").removeClass('active');
  $("#drawerBackground").removeClass('active');
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
    const sortConditions = backgroundPage.getSortConditions();
    if (sortConditions.length == 0) {
      sortConditions.push("score");
    }
    /*
    sortConditions.forEach(function(condition){
      $(`#sortCondition_${condition}`).prop('checked', true);
    });*/
    refreshList();
  });
})();
