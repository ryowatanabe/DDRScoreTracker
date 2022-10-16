import { I18n } from '../static/common/I18n.js';

const filterNames = ['playMode', 'musicType', 'difficulty', 'level', 'clearType', 'scoreRank', 'availability'];

let app;
let savedConditions = [];

function getConditions() {
  const result = {
    summary: {},
    filter: [],
    sort: [],
  };

  const elements = Array.from(document.querySelectorAll(`input[name=summarySetting]:checked`));
  elements.forEach((element) => {
    result.summary[element.value] = true;
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

  app.saveConditions(conditions.summary, conditions.filter, conditions.sort);
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

export function initialize(a) {
  app = a;
  document.getElementById('filterContainer').classList.remove('not-initialized');
  document.getElementById('filterBackground').classList.remove('not-initialized');
  document.getElementById('filterContainer').classList.add('initialized');
  document.getElementById('filterBackground').classList.add('initialized');

  /* All, Noneのイベントハンドラをつける */
  document.getElementById('summarySetting_all').addEventListener('click', selectAll.bind(this, 'summarySetting'));
  document.getElementById('summarySetting_clear').addEventListener('click', selectNone.bind(this, 'summarySetting'));
  filterNames.forEach((name) => {
    document.getElementById(`filterCondition_${name}_all`).addEventListener('click', selectAll.bind(this, `filterCondition_${name}`));
    document.getElementById(`filterCondition_${name}_clear`).addEventListener('click', selectNone.bind(this, `filterCondition_${name}`));
  });
  /* saved filtersのプルダウンを作る */
  savedConditions = app.getSavedConditions();
  updateSavedFilterSelect();

  /* デフォルトのチェックをつける */
  const conditions = app.getConditions();
  applyConditions(conditions);

  refreshList();
}

function openFilter() {
  document.getElementById('filterContainer').scrollTo(0, 0);
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
  while (savedFilterSelect.firstChild) {
    savedFilterSelect.removeChild(savedFilterSelect.firstChild);
  }

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
  document.querySelectorAll(`input[name=summarySetting]`).forEach((element) => {
    element.checked = false;
  });
  filterNames.forEach((name) => {
    document.querySelectorAll(`input[name=filterCondition_${name}]`).forEach((element) => {
      element.checked = false;
    });
  });
  // check
  Object.keys(conditions.summary).forEach(function (key) {
    document.querySelector(`#summarySetting_${key}`).checked = true;
  });
  conditions.filter.forEach(function (condition) {
    condition.values.forEach(function (value) {
      const element = document.querySelector(`#filterCondition_${condition.attribute}_${value}`);
      if (element) {
        element.checked = true;
      }
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

  const conditions = getConditions();
  conditions.name = filterName;
  savedConditions = app.saveSavedCondition(conditions);
  updateSavedFilterSelect(filterName);
}

function saveAsFilter() {
  let filterName;
  do {
    filterName = window.prompt('', '').trim();
  } while (filterName == '');

  const conditions = getConditions();
  conditions.name = filterName;
  savedConditions = app.saveSavedCondition(conditions);
  updateSavedFilterSelect(filterName);
}

document.getElementById('savedFilterSelect').addEventListener('change', applySavedFilter);
document.getElementById('saveFilterButton').addEventListener('click', saveFilter);
document.getElementById('saveAsFilterButton').addEventListener('click', saveAsFilter);

document.getElementById('openFilterButton').addEventListener('click', openFilter);
document.getElementById('closeFilterButton').addEventListener('click', closeFilter);
