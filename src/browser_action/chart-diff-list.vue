<template>
  <div>
    <div id="diffBackground" class="drawer-background not-initialized"></div>
    <div id="diffContainer" class="drawer diff not-initialized">
      <div id="closeButton" class="drawer-switch" @click="close">{{ getMessage('diff_container_close_button') }}</div>

      <div id="app-charts" class="content">
        <div v-if="maxPage > 1" class="pager">
          <template v-for="index of maxPage" :key="index">
            <a v-if="index == currentPage" :class="['element', 'current']">[{{ index }}]</a
            ><a v-if="index != currentPage" :class="['element', 'link']" @click="gotoPage(index)">[{{ index }}]</a>
          </template>
        </div>

        <template v-if="differences.length > 0">
          <div class="score_list">
            <template v-for="difference in pageDifferences" :key="difference.musicId + '_' + difference.playMode + '_' + difference.difficulty">
              <div :class="['level', difference.difficultyClassString]">{{ difference.levelString }}{{ difference.playModeSymbol }}</div>
              <div class="title">{{ difference.title }}</div>

              <div :class="['flare_rank', difference.beforeFlareRankClassString]">
                {{ difference.beforeFlareRankSymbol }}
              </div>
              <div class="flare_skill">
                {{ difference.beforeFlareSkill }}
              </div>
              <div :class="['score_rank', difference.beforeScoreRankClassString]">
                {{ difference.beforeScoreRankString }}
              </div>
              <div :class="['full_combo_type', difference.beforeClearTypeClassString]">
                {{ difference.beforeFullComboSymbol }}
              </div>
              <div class="score">{{ difference.beforeScoreString }}</div>

              <div>→</div>

              <div :class="['flare_rank', difference.afterFlareRankClassString]">
                {{ difference.afterFlareRankSymbol }}
              </div>
              <div class="flare_skill">
                {{ difference.afterFlareSkill }}
              </div>
              <div :class="['score_rank', difference.afterScoreRankClassString]">
                {{ difference.afterScoreRankString }}
              </div>
              <div :class="['full_combo_type', difference.afterClearTypeClassString]">
                {{ difference.afterFullComboSymbol }}
              </div>
              <div class="score">{{ difference.afterScoreString }}</div>
            </template>
          </div>
        </template>
        <template v-else>
          <div>{{ getMessage('diff_container_no_update') }}</div>
        </template>

        <div v-if="maxPage > 1" class="pager">
          <template v-for="index of maxPage" :key="index">
            <a v-if="index == currentPage" :class="['element', 'current']">[{{ index }}]</a
            ><a v-if="index != currentPage" :class="['element', 'link']" @click="gotoPage(index)">[{{ index }}]</a>
          </template>
        </div>
      </div>

      <div id="closeButton2" class="drawer-switch" @click="close">{{ getMessage('diff_container_close_button') }}</div>
    </div>
  </div>
</template>

<script>
import { Constants } from '../static/common/Constants.js';
import { I18n } from '../static/common/I18n.js';

function compareScoreDiff(a, b, sortConditions) {
  if (sortConditions.length == 0) {
    return 0;
  }
  const attribute = sortConditions[0].attribute;
  let lt = -1;
  let gt = 1;
  if (sortConditions[0].order == 'desc') {
    lt = 1;
    gt = -1;
  }
  if (a[attribute] === b[attribute]) {
    return compareScoreDiff(a, b, sortConditions.slice(1));
  }
  if (a[attribute] < b[attribute] || a[attribute] === null) {
    return lt;
  }
  return gt;
}

let app;

function initialize(a) {
  app = a;
  document.getElementById('diffContainer').classList.remove('not-initialized');
  document.getElementById('diffBackground').classList.remove('not-initialized');
  document.getElementById('diffContainer').classList.add('initialized');
  document.getElementById('diffBackground').classList.add('initialized');
}

function open() {
  document.getElementById('diffContainer').classList.add('active');
  document.getElementById('diffBackground').classList.add('active');
}

function close() {
  document.getElementById('diffContainer').classList.remove('active');
  document.getElementById('diffBackground').classList.remove('active');
}

export default {
  data() {
    return {
      maxPage: 1,
      currentPage: 1,
      pageDifferences: [],
      differences: [],
    };
  },
  methods: {
    getMessage(key) {
      return I18n.getMessage(key);
    },
    setData(differences) {
      this.differences = differences;
      this.maxPage = Math.ceil(this.differences.length / Constants.PAGE_LENGTH);
      this.gotoPage(1);
    },
    gotoPage(page) {
      this.pageDifferences = this.differences.slice((page - 1) * Constants.PAGE_LENGTH, page * Constants.PAGE_LENGTH);
      this.currentPage = page;
    },
    close() {
      close();
    },
    loadAndOpen() {
      const differences = app.getDifferences();
      const sortConditions = [
        { attribute: 'playMode', order: 'asc' },
        { attribute: 'level', order: 'desc' },
        { attribute: 'afterScore', order: 'desc' },
        { attribute: 'beforeScore', order: 'desc' },
        { attribute: 'title', order: 'asc' },
      ];
      differences.sort(function (a, b) {
        return compareScoreDiff(a, b, sortConditions);
      });
      this.setData(differences);
      this.open();
    },
    open() {
      open();
    },
    initialize(app) {
      initialize(app);
    },
  },
};
</script>

<style scoped>
/*
ページャー
*/

.pager .element {
  font-size: 1.2rem;
  margin-left: 5px;
  margin-right: 5px;
}

.pager .current {
  color: #ffffff;
}

.pager .link {
  color: #ffff00;
  cursor: pointer;
}

/*
進捗グラフ
*/

.graph {
  box-sizing: border-box;
  width: 100%;
  height: 20px;
  padding: 2px;
  border: 1px solid #ffffff;
}
.graph .inner {
  box-sizing: border-box;
  height: 100%;
}
.graph .element {
  box-sizing: border-box;
  display: inline-block;
  height: 100%;
}
.graph .element.no_play {
  background-color: #888888;
}
.graph .element.failed {
  background-color: #883300;
}
.graph .element.assist_clear {
  background-color: #8000ff;
}
.graph .element.clear {
  background-color: #ff8800;
}
.graph .element.life4 {
  background-color: #ff0000;
}
.graph .element.good_fc {
  background-color: #0088ff;
}
.graph .element.great_fc {
  background-color: #00ff00;
}
.graph .element.perfect_fc {
  background-color: #ffff00;
}
.graph .element.marvelous_fc {
  background-color: #ffffff;
}

.graph .rank_aaa {
  background-color: #ffffff;
}
.graph .rank_aa_p,
.graph .rank_aa,
.graph .rank_aa_m {
  background-color: #ffffaa;
}
.graph .rank_a_p,
.graph .rank_a,
.graph .rank_a_m {
  background-color: #ffff00;
}
.graph .rank_b_p,
.graph .rank_b,
.graph .rank_b_m {
  background-color: #0088ff;
}
.graph .rank_c_p,
.graph .rank_c,
.graph .rank_c_m {
  background-color: #ff00ff;
}
.graph .rank_d_p,
.graph .rank_d {
  background-color: #ff0000;
}
.graph .rank_e {
  background-color: #bbbbbb;
}
.graph .rank_none {
  background-color: #888888;
}

/*
スコアリストのグリッド表示
*/

.score_list {
  clear: right;
  display: grid;
  grid-template-columns:
    minmax(1px, max-content) auto minmax(1px, max-content) minmax(1px, max-content) minmax(1px, max-content) minmax(1px, max-content) minmax(1px, max-content) minmax(
      1px,
      max-content
    )
    minmax(1px, max-content) minmax(1px, max-content) minmax(1px, max-content) minmax(1px, max-content)
    minmax(1px, max-content);
}

.score_list > div {
  border-bottom: 1px solid #ffffff;
  white-space: nowrap;
  padding: 2px;
}
.score_list > .level {
  text-align: right;
  font-size: 1.2rem;
  font-weight: bold;
}
.score_list > .title {
  font-size: 1rem;
  overflow-x: hidden;
  text-overflow: ellipsis;
}
.score_list > .flare_rank {
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
}
.score_list > .flare_skill {
  text-align: right;
  font-family: monospace;
  font-size: 1rem;
}
.score_list > .clear_count {
  text-align: right;
  font-family: monospace;
  font-size: 1rem;
}
.score_list > .play_count {
  text-align: right;
  font-family: monospace;
  font-size: 1rem;
}
.score_list > .score_rank {
  font-size: 1.2rem;
  font-weight: bold;
}
.score_list > .full_combo_type {
  font-size: 1.2rem;
  font-weight: bold;
}
.score_list > .score {
  text-align: right;
  font-family: monospace;
  font-size: 1rem;
}
.score_list > .max_combo {
  text-align: right;
  font-family: monospace;
  font-size: 1rem;
}

.beginner {
  color: #00ffff;
}
.basic {
  color: #ff8800;
}
.difficult {
  color: #ff4444;
}
.expert {
  color: #00ff00;
}
.challenge {
  color: #ff00ff;
}

.rank_aaa {
  color: #ffffff;
}
.rank_aa_p,
.rank_aa,
.rank_aa_m {
  color: #ffffaa;
}
.rank_a_p,
.rank_a,
.rank_a_m {
  color: #ffff00;
}
.rank_b_p,
.rank_b,
.rank_b_m {
  color: #0088ff;
}
.rank_c_p,
.rank_c,
.rank_c_m {
  color: #ff00ff;
}
.rank_d_p,
.rank_d {
  color: #ff0000;
}
.rank_e {
  color: #bbbbbb;
}

.life4 {
  color: #ff0000;
}
.good_fc {
  color: #0088ff;
}
.great_fc {
  color: #00ff00;
}
.perfect_fc {
  color: #ffff00;
}
.marvelous_fc {
  color: #ffffff;
}

.flare_1 {
  color: #0000ff;
}
.flare_2 {
  color: #00ffff;
}
.flare_3 {
  color: #00ff00;
}
.flare_4 {
  color: #ffff00;
}
.flare_5 {
  color: #ff0000;
}
.flare_6 {
  color: #ff00ff;
}
.flare_7 {
  color: #999999;
}
.flare_8 {
  color: #cccccc;
}
.flare_9 {
  color: #ffffff;
}
.flare_ex {
  color: #00ffff;
}
</style>
<style scoped>
.diff {
  height: 100%;
  overflow: scroll;
}
.content {
  clear: right;
}
</style>
<style src="../static/browser_action/drawer.css" scoped></style>
