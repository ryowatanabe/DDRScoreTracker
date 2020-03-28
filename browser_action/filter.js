function refreshList() {
  let filterConditions = [];
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

  let sortConditions = [{
    attribute: $(`input[name=sortCondition_attribute]:checked`).get()[0].value,
    order: $(`input[name=sortCondition_order]:checked`).get()[0].value
  }];

  chrome.runtime.getBackgroundPage(function(backgroundPage){
    backgroundPage.saveFilterConditions(filterConditions, sortConditions);
  });
  refreshListImpl(filterConditions, sortConditions.concat([
    /* tie breakers */
    { attribute: "title", order: "asc" },
    { attribute: "playMode", order: "asc" },
    { attribute: "difficulty", order: "asc" }
  ]));
}

function openFilter() {
  $("#filterContainer").addClass('active');
  $("#filterBackground").addClass('active');
}
function closeFilter() {
  $("#filterContainer").removeClass('active');
  $("#filterBackground").removeClass('active');
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
      sortConditions.push({ attribute: "score", order: "desc" });
    }
    sortConditions.forEach(function(condition){
      $(`#sortCondition_attribute_${condition.attribute}`).prop('checked', true);
      $(`#sortCondition_order_${condition.order}`).prop('checked', true);
    });
    refreshList();
  });
})();
