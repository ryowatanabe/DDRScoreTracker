import { refreshList as refreshListImpl } from './Main.js';

const filterNames = ['playMode', 'musicType', 'difficulty', 'level', 'clearType', 'scoreRank'];

export function refreshList() {
  let filterConditions = [];
  filterNames.forEach(function (name) {
    const elements = $(`input[name=${name}]:checked`);
    if (elements.length > 0) {
      const condition = {
        attribute: name,
        values: jQuery.map(elements, function (element) {
          return parseInt(element.value, 10);
        }),
      };
      filterConditions.push(condition);
    }
  });

  let sortConditions = [
    {
      attribute: $(`input[name=sortCondition_attribute]:checked`).get()[0].value,
      order: $(`input[name=sortCondition_order]:checked`).get()[0].value,
    },
  ];

  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    backgroundPage.saveConditions(filterConditions, sortConditions);
  });
  refreshListImpl(
    filterConditions,
    sortConditions.concat([
      /* tie breakers */
      { attribute: 'title', order: 'asc' },
      { attribute: 'playMode', order: 'asc' },
      { attribute: 'difficulty', order: 'asc' },
    ])
  );
}

function openFilter() {
  $('#filterContainer').addClass('active');
  $('#filterBackground').addClass('active');
}
function closeFilter() {
  $('#filterContainer').removeClass('active');
  $('#filterBackground').removeClass('active');
  setTimeout(refreshList, 300);
}

function selectAll(name) {
  const elements = $(`input[name=${name}]`);
  jQuery.map(elements, (element) => {
    $(element).prop('checked', true);
  });
}
function selectNone(name) {
  const elements = $(`input[name=${name}]`);
  jQuery.map(elements, (element) => {
    $(element).prop('checked', false);
  });
}

document.getElementById('openFilterButton').addEventListener('click', openFilter);
document.getElementById('closeFilterButton').addEventListener('click', closeFilter);

(function () {
  /* All, Noneのイベントハンドラをつける */
  filterNames.forEach((name) => {
    document.getElementById(`filterCondition_${name}_all`).addEventListener('click', selectAll.bind(this, name));
    document.getElementById(`filterCondition_${name}_clear`).addEventListener('click', selectNone.bind(this, name));
  });
  /* デフォルトのチェックをつける */
  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    const conditions = backgroundPage.getConditions();
    conditions.filter.forEach(function (condition) {
      condition.values.forEach(function (value) {
        $(`#filterCondition_${condition.attribute}_${value}`).prop('checked', true);
      });
    });
    if (conditions.sort.length == 0) {
      conditions.sort.push({ attribute: 'score', order: 'desc' });
    }
    conditions.sort.forEach(function (condition) {
      $(`#sortCondition_attribute_${condition.attribute}`).prop('checked', true);
      $(`#sortCondition_order_${condition.order}`).prop('checked', true);
    });
    refreshList();
  });
})();