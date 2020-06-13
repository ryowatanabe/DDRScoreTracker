<template>
  <div id="app-charts" class="content">
    <template v-if="charts.length > 0">
      <template v-for="item in statistics.clearType">
        <template v-if="item.count > 0"> {{ item.clearTypeString }}:{{ item.count }} </template>
      </template>
      <div class="graph">
        <div class="inner">
          <template v-for="item in statistics.clearType"
            ><template v-if="item.count > 0"
              ><span v-bind:class="['element', item.clearTypeClassString]" v-bind:style="{ width: 'calc(' + item.count + ' / ' + charts.length + ' * 100%' }"></span></template
          ></template>
        </div>
      </div>
      <template v-for="item in statistics.scoreRank">
        <template v-if="item.count > 0"> {{ item.scoreRankString }}:{{ item.count }} </template>
      </template>
      <div class="graph">
        <div class="inner">
          <template v-for="item in statistics.scoreRank"
            ><template v-if="item.count > 0"
              ><span v-bind:class="['element', item.scoreRankClassString]" v-bind:style="{ width: 'calc(' + item.count + ' / ' + charts.length + ' * 100%' }"></span></template
          ></template>
        </div>
      </div>
      <template v-for="name in statistics.score.order">
        {{ getMessage('chart_list_summary_score_' + name) }}:{{ statistics.score[name].string }}
        <div class="graph">
          <div class="inner">
            <span
              v-bind:class="['element', statistics.score[name].scoreRankClassString]"
              v-bind:style="{ width: 'calc(' + statistics.score[name].value + ' / ' + 1000000 + ' * 100%' }"
              ></span>
          </div>
        </div>
      </template>
      <template v-for="name in statistics.score.order">{{ getMessage('chart_list_summary_score_' + name) }}:{{ statistics.score[name].string }} </template>
    </template>

    <div v-if="maxPage > 1" class="pager">
      <template v-for="index of maxPage">
        <a v-if="index == currentPage" v-bind:class="['element', 'current']">[{{ index }}]</a
        ><a v-if="index != currentPage" v-on:click="gotoPage(index)" v-bind:class="['element', 'link']">[{{ index }}]</a>
      </template>
    </div>

    <div class="score_list">
      <template v-for="chart in pageCharts">
        <div v-bind:class="['level', chart.difficultyClassString]">{{ chart.level }}{{ chart.playModeSymbol }}</div>
        <div class="title">{{ chart.title }}</div>
        <div class="clear_count">
          <template v-if="chart.clearCount !== null">{{ chart.clearCount }}/</template>
        </div>
        <div class="play_count">
          <template v-if="chart.playCount !== null">{{ chart.playCount }}</template>
        </div>
        <div v-bind:class="['score_rank', chart.scoreRankClassString]">{{ chart.scoreRankString }}</div>
        <div v-bind:class="['full_combo_type', chart.clearTypeClassString]">{{ chart.fullComboSymbol }}</div>
        <div class="score">{{ chart.scoreString }}</div>
        <div class="max_combo">
          <template v-if="chart.maxCombo !== null">/{{ chart.maxCombo }}</template>
        </div>
      </template>
    </div>

    <div v-if="maxPage > 1" class="pager">
      <template v-for="index of maxPage">
        <a v-if="index == currentPage" v-bind:class="['element', 'current']">[{{ index }}]</a
        ><a v-if="index != currentPage" v-on:click="gotoPage(index)" v-bind:class="['element', 'link']">[{{ index }}]</a>
      </template>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { Constants } from '../static/common/Constants.js';
import { I18n } from '../static/common/I18n.js';

export default Vue.extend({
  data: function () {
    return {
      maxPage: 1,
      currentPage: 1,
      statistics: {},
      pageCharts: [],
      charts: [],
    };
  },
  methods: {
    getMessage: I18n.getMessage,
    gotoPage: function (page) {
      gotoPage(page);
    },
  },
});
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
  display: grid;
  grid-template-columns: minmax(1px, max-content) auto minmax(1px, max-content) minmax(1px, max-content) minmax(1px, max-content) minmax(1px, max-content) minmax(1px, max-content) minmax(
      1px,
      max-content
    );
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
</style>
