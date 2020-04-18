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
    gotoPage: function (page) {
      gotoPage(page);
    },
  },
});
</script>

<style scoped>
</style>
