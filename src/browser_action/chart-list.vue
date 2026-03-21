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
      <template v-if="summarySettings.flareRank">
        <template v-for="item in statistics.flareRank">
          <template v-if="item.count > 0"> {{ item.flareRankString }}:{{ item.count }}&nbsp;</template>
        </template>
        <div class="graph">
          <div class="inner">
            <template v-for="item in statistics.flareRank" :key="item.flareRank"
              ><template v-if="item.count > 0"
                ><span :class="['element', item.flareRankClassString]" :style="{ width: 'calc(' + item.count + ' / ' + charts.length + ' * 100%' }"></span></template
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
        <a v-if="index === currentPage" :class="['element', 'current']">[{{ index }}]</a
        ><a v-if="index !== currentPage" :class="['element', 'link']" @click="gotoPage(index)">[{{ index }}]</a>
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
          {{ chart.flareRankSymbol }}
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
        <a v-if="index === currentPage" :key="index" :class="['element', 'current']">[{{ index }}]</a
        ><a v-if="index !== currentPage" :key="index" :class="['element', 'link']" @click="gotoPage(index)">[{{ index }}]</a>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
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
スコアリストのグリッド表示（列定義のみ、共通セルスタイルは ddr-components.css）
*/

.score_list {
  @apply clear-right grid;
  grid-template-columns:
    minmax(1px, max-content) auto minmax(1px, max-content) minmax(1px, max-content) minmax(1px, max-content) minmax(1px, max-content) minmax(1px, max-content) minmax(
      1px,
      max-content
    )
    minmax(1px, max-content) minmax(1px, max-content);
}
</style>
