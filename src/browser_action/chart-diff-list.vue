<template>
  <div>
    <div id="diffBackground" class="drawer-background not-initialized"></div>
    <div id="diffContainer" class="drawer diff not-initialized">
      <div id="closeButton" class="drawer-switch" @click="close">{{ getMessage('diff_container_close_button') }}</div>

      <div id="diff-app-charts" class="content">
        <div v-if="maxPage > 1" class="pager">
          <template v-for="index of maxPage" :key="index">
            <a v-if="index === currentPage" :class="['element', 'current']">[{{ index }}]</a
            ><a v-if="index !== currentPage" :class="['element', 'link']" @click="gotoPage(index)">[{{ index }}]</a>
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
            <a v-if="index === currentPage" :class="['element', 'current']">[{{ index }}]</a
            ><a v-if="index !== currentPage" :class="['element', 'link']" @click="gotoPage(index)">[{{ index }}]</a>
          </template>
        </div>
      </div>

      <div id="closeButton2" class="drawer-switch" @click="close">{{ getMessage('diff_container_close_button') }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Constants } from '../static/common/Constants.js';
import { I18n } from '../static/common/I18n.js';

function compareScoreDiff(a, b, sortConditions) {
  if (sortConditions.length === 0) {
    return 0;
  }
  const attribute = sortConditions[0].attribute;
  let lt = -1;
  let gt = 1;
  if (sortConditions[0].order === 'desc') {
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
      const musicList = app.getMusicList();
      differences.forEach((difference) => {
        if (musicList.hasMusic(difference.musicId)) {
          difference.musicData = musicList.getMusicDataById(difference.musicId);
        }
      });
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
スコアリストのグリッド表示（列定義のみ、共通セルスタイルは ddr-components.css）
*/

.score_list {
  @apply clear-right grid;
  grid-template-columns:
    minmax(1px, max-content) auto minmax(1px, max-content) minmax(1px, max-content) minmax(1px, max-content) minmax(1px, max-content) minmax(1px, max-content) minmax(
      1px,
      max-content
    )
    minmax(1px, max-content) minmax(1px, max-content) minmax(1px, max-content) minmax(1px, max-content)
    minmax(1px, max-content);
}

.diff {
  @apply h-full overflow-scroll;
}
.content {
  @apply clear-right;
}
</style>
