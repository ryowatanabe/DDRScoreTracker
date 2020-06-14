const summaryNames = ['clearType', 'scoreRank', 'scoreMax', 'scoreAverage', 'scoreMedian', 'scoreMin', 'scoreStatistics'];
const filterNames = ['playMode', 'musicType', 'difficulty', 'level', 'clearType', 'scoreRank'];

export function refreshList() {
  let summarySettings = {};
  summaryNames.forEach((name) => {
    const elements = Array.from(document.querySelectorAll(`input[name=summarySetting_${name}]:checked`));
    if (elements.length > 0) {
      summarySettings[name] = true;
    }
  });

  let filterConditions = [];
  filterNames.forEach((name) => {
    const elements = Array.from(document.querySelectorAll(`input[name=filterCondition_${name}]:checked`));
    if (elements.length > 0) {
      const condition = {
        attribute: name,
        values: elements.map((element) => {
          return parseInt(element.value, 10);
        }),
      };
      filterConditions.push(condition);
    }
  });

  let sortConditions = [
    {
      attribute: document.querySelector(`input[name=sortCondition_attribute]:checked`).value,
      order: document.querySelector(`input[name=sortCondition_order]:checked`).value,
    },
  ];

  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    backgroundPage.saveConditions(filterConditions, sortConditions);
  });
  window.refreshList(
    summarySettings,
    filterConditions,
    sortConditions.concat([
      /* tie breakers */
      { attribute: 'title', order: 'asc' },
      { attribute: 'playMode', order: 'asc' },
      { attribute: 'difficulty', order: 'asc' },
    ])
  );
}

export function initialize() {
  document.getElementById('filterContainer').classList.remove('not-initialized');
  document.getElementById('filterBackground').classList.remove('not-initialized');
  document.getElementById('filterContainer').classList.add('initialized');
  document.getElementById('filterBackground').classList.add('initialized');
}

function openFilter() {
  document.getElementById('filterContainer').classList.add('active');
  document.getElementById('filterBackground').classList.add('active');
}
function closeFilter() {
  document.getElementById('filterContainer').classList.remove('active');
  document.getElementById('filterBackground').classList.remove('active');
  setTimeout(refreshList, 300);
}

function selectAll(name) {
  const elements = document.querySelectorAll(`input[name=filterCondition_${name}]`);
  elements.forEach((element) => {
    element.checked = true;
  });
}
function selectNone(name) {
  const elements = document.querySelectorAll(`input[name=filterCondition_${name}]`);
  elements.forEach((element) => {
    element.checked = false;
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
        document.querySelector(`#filterCondition_${condition.attribute}_${value}`).checked = true;
      });
    });
    if (conditions.sort.length == 0) {
      conditions.sort.push({ attribute: 'score', order: 'desc' });
    }
    conditions.sort.forEach(function (condition) {
      document.querySelector(`#sortCondition_attribute_${condition.attribute}`).checked = true;
      document.querySelector(`#sortCondition_order_${condition.order}`).checked = true;
    });
    refreshList();
  });
})();
