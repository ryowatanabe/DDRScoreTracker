<template>
  <div id="app-charts" class="content">
    <template v-if="charts.length > 0">
      <template v-if="summarySettings.clearType">
        <template v-for="item in statistics.clearType">
          <template v-if="item.count > 0"> {{ item.clearTypeString }}:{{ item.count }}&nbsp;</template>
        </template>
        <div class="graph">
          <div class="inner">
            <template v-for="item in statistics.clearType" :key="item.clearType"
              ><template v-if="item.count > 0"
                ><span :class="['element', item.clearTypeClassString]" :style="{ width: 'calc(' + item.count + ' / ' + charts.length + ' * 100%' }"></span></template
            ></template>
          </div>
        </div>
      </template>
      <template v-if="summarySettings.scoreRank">
        <template v-for="item in statistics.scoreRank">
          <template v-if="item.count > 0"> {{ item.scoreRankString }}:{{ item.count }}&nbsp;</template>
        </template>
        <div class="graph">
          <div class="inner">
            <template v-for="item in statistics.scoreRank" :key="item.scoreRank"
              ><template v-if="item.count > 0"
                ><span :class="['element', item.scoreRankClassString]" :style="{ width: 'calc(' + item.count + ' / ' + charts.length + ' * 100%' }"></span></template
            ></template>
          </div>
        </div>
      </template>
      <template v-for="name in statistics.score.order" :key="name">
        <template v-if="summarySettings[statistics.score[name].label]">
          {{ getMessage('chart_list_summary_score_' + name) }}:{{ statistics.score[name].string }}
          <div class="graph">
            <div class="inner">
              <span
                :class="['element', statistics.score[name].scoreRankClassString]"
                :style="{ width: 'calc(' + statistics.score[name].value + ' / ' + 1000000 + ' * 100%' }"
              ></span>
            </div>
          </div>
        </template>
      </template>
      <template v-if="summarySettings.scoreStatistics">
        <template v-for="name in statistics.score.order">{{ getMessage('chart_list_summary_score_' + name) }}:{{ statistics.score[name].string }}&nbsp;</template>
      </template>
    </template>

    <div v-if="maxPage > 1" class="pager">
      <template v-for="index of maxPage" :key="index">
        <a v-if="index == currentPage" :class="['element', 'current']">[{{ index }}]</a
        ><a v-if="index != currentPage" :class="['element', 'link']" @click="gotoPage(index)">[{{ index }}]</a>
      </template>
    </div>

    <div class="score_list">
      <template v-for="chart in pageCharts" :key="chart.musicId + '_' + chart.playMode + '_' + chart.difficulty">
        <div :class="['level', chart.difficultyClassString]">{{ chart.levelString }}{{ chart.playModeSymbol }}</div>
        <div class="title">{{ chart.title }}</div>
        <div class="clear_count">
          <template v-if="chart.clearCount !== null">{{ chart.clearCount }}/</template>
        </div>
        <div class="play_count">
          <template v-if="chart.playCount !== null">{{ chart.playCount }}</template>
        </div>
        <div :class="['flare_rank', chart.flareRankClassString]">
          {{ chart.flareRankString }}
        </div>
        <div class="flare_skill">
          {{ chart.flareSkill }}
        </div>
        <div :class="['score_rank', chart.scoreRankClassString]">
          {{ chart.scoreRankString }}
        </div>
        <div :class="['full_combo_type', chart.clearTypeClassString]">
          {{ chart.fullComboSymbol }}
        </div>
        <div class="score">{{ chart.scoreString }}</div>
        <div class="max_combo">
          <template v-if="chart.maxCombo !== null">/{{ chart.maxCombo }}</template>
        </div>
      </template>
    </div>

    <div v-if="maxPage > 1" class="pager">
      <template v-for="index of maxPage">
        <a v-if="index == currentPage" :key="index" :class="['element', 'current']">[{{ index }}]</a
        ><a v-if="index != currentPage" :key="index" :class="['element', 'link']" @click="gotoPage(index)">[{{ index }}]</a>
      </template>
    </div>
  </div>
</template>

<script>
import { Constants } from '../static/common/Constants.js';
import { I18n } from '../static/common/I18n.js';

export default {
  data() {
    return {
      maxPage: 1,
      currentPage: 1,
      statistics: {},
      pageCharts: [],
      charts: [],
      summarySettings: {},
    };
  },
  methods: {
    getMessage(key) {
      return I18n.getMessage(key);
    },
    setData(chartList) {
      this.statistics = chartList.statistics;
      this.charts = chartList.charts;
      this.maxPage = Math.ceil(this.charts.length / Constants.PAGE_LENGTH);
      this.gotoPage(1);
    },
    gotoPage(page) {
      this.pageCharts = this.charts.slice((page - 1) * Constants.PAGE_LENGTH, page * Constants.PAGE_LENGTH);
      this.currentPage = page;
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
    minmax(1px, max-content) minmax(1px, max-content);
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
