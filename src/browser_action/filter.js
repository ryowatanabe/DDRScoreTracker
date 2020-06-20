import { I18n } from '../static/common/I18n.js';

const summaryNames = ['clearType', 'scoreRank', 'scoreMax', 'scoreAverage', 'scoreMedian', 'scoreMin', 'scoreStatistics'];
const filterNames = ['playMode', 'musicType', 'difficulty', 'level', 'clearType', 'scoreRank'];

let savedConditions = [];

function getConditions() {
  const result = {
    summary: {},
    filter: [],
    sort: [],
  };

  summaryNames.forEach((name) => {
    const elements = Array.from(document.querySelectorAll(`input[name=summarySetting]:checked`));
    elements.forEach((element) => {
      result.summary[element.value] = true;
    });
  });

  filterNames.forEach((name) => {
    const elements = Array.from(document.querySelectorAll(`input[name=filterCondition_${name}]:checked`));
    if (elements.length > 0) {
      const condition = {
        attribute: name,
        values: elements.map((element) => {
          return parseInt(element.value, 10);
        }),
      };
      result.filter.push(condition);
    }
  });

  result.sort = [
    {
      attribute: document.querySelector(`input[name=sortCondition_attribute]:checked`).value,
      order: document.querySelector(`input[name=sortCondition_order]:checked`).value,
    },
  ];

  return result;
}

export function refreshList() {
  const conditions = getConditions();

  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    backgroundPage.saveConditions(conditions.summary, conditions.filter, conditions.sort);
  });
  window.refreshList(
    conditions.summary,
    conditions.filter,
    conditions.sort.concat([
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
  const elements = document.querySelectorAll(`input[name=${name}]`);
  elements.forEach((element) => {
    element.checked = true;
  });
}
function selectNone(name) {
  const elements = document.querySelectorAll(`input[name=${name}]`);
  elements.forEach((element) => {
    element.checked = false;
  });
}

function updateSavedFilterSelect(selectedValue = '') {
  const savedFilterSelect = document.getElementById('savedFilterSelect');
  while (savedFilterSelect.firstChild) { savedFilterSelect.removeChild(savedFilterSelect.firstChild); }

  savedConditions.forEach((savedCondition) => {
    const option = document.createElement('option');
    const textContent = document.createTextNode(savedCondition.name);
    option.setAttribute('value', savedCondition.name);
    option.appendChild(textContent);
    savedFilterSelect.appendChild(option);
  });
  const option = document.createElement('option');
  const textContent = document.createTextNode(I18n.getMessage('browser_action_filter_saved_filters_new_filter'));
  option.setAttribute('value', '');
  option.appendChild(textContent);
  savedFilterSelect.appendChild(option);
  savedFilterSelect.value = selectedValue;
}

function applyConditions(conditions) {
  // reset
  summaryNames.forEach((name) => {
    document.querySelectorAll(`input[name=summarySetting]`).forEach((element) => {
      element.checked = false;
    });
  });
  filterNames.forEach((name) => {
    document.querySelectorAll(`input[name=filterCondition_${name}]`).forEach((element) => {
      element.checked = false;
    });
  });
  // check
  for (let [key, value] of Object.entries(conditions.summary)) {
    document.querySelector(`#summarySetting_${key}`).checked = true;
  }
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
}

function applySavedFilter() {
  const filterName = document.getElementById('savedFilterSelect').value;
  if (filterName != '') {
    savedConditions.forEach((savedCondition) => {
      if (savedCondition.name == filterName) {
        applyConditions(savedCondition);
      }
    });
  }
}

function saveFilter() {
  const filterName = document.getElementById('savedFilterSelect').value;
  if (filterName == '') {
    saveAsFilter();
    return;
  }

  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    const conditions = getConditions();
    conditions.name = filterName;
    savedConditions = backgroundPage.saveSavedCondition(conditions);
    updateSavedFilterSelect(filterName);
  });
}

function saveAsFilter() {
  let filterName;
  do {
    filterName = window.prompt('', '').trim();
  } while (filterName == '');

  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    const conditions = getConditions();
    conditions.name = filterName;
    savedConditions = backgroundPage.saveSavedCondition(conditions);
    updateSavedFilterSelect(filterName);
  });
}

document.getElementById('savedFilterSelect').addEventListener('change', applySavedFilter);
document.getElementById('saveFilterButton').addEventListener('click', saveFilter);
document.getElementById('saveAsFilterButton').addEventListener('click', saveAsFilter);

document.getElementById('openFilterButton').addEventListener('click', openFilter);
document.getElementById('closeFilterButton').addEventListener('click', closeFilter);

(function () {
  /* All, Noneのイベントハンドラをつける */
  document.getElementById('summarySetting_all').addEventListener('click', selectAll.bind(this, 'summarySetting'));
  document.getElementById('summarySetting_clear').addEventListener('click', selectNone.bind(this, 'summarySetting'));
  filterNames.forEach((name) => {
    document.getElementById(`filterCondition_${name}_all`).addEventListener('click', selectAll.bind(this, `filterCondition_${name}`));
    document.getElementById(`filterCondition_${name}_clear`).addEventListener('click', selectNone.bind(this, `filterCondition_${name}`));
  });
  chrome.runtime.getBackgroundPage(function (backgroundPage) {
    /* saved filtersのプルダウンを作る */
    savedConditions = backgroundPage.getSavedConditions();
    updateSavedFilterSelect();

    /* デフォルトのチェックをつける */
    const conditions = backgroundPage.getConditions();
    applyConditions(conditions);

    refreshList();
  });
})();
