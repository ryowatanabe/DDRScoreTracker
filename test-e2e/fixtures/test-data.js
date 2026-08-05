/**
 * Fixture data for Playwright E2E tests.
 *
 * chrome.storage.local に直接投入するための、実際の保存フォーマットのデータ。
 * 各キーの形は以下の実装に対応する:
 *   musics  → MusicList.createFromStorage / MusicData.createFromStorage
 *   scores  → ScoreList.createFromStorage / ScoreData.createFromStorage / ScoreDetail.createFromStorage
 *
 * difficulty 配列は 9 要素で、添字は Util.getDifficultyValue(playMode, difficulty) と一致する。
 *   [0..4] = SP BEGINNER / BASIC / DIFFICULT / EXPERT / CHALLENGE
 *   [5..8] = DP BASIC / DIFFICULT / EXPERT / CHALLENGE  (DP に BEGINNER はない)
 * 値 0 は「その譜面が存在しない」を意味する (MusicData.hasDifficulty)。
 */

'use strict';

const MUSIC_ALPHA_ID = 'e2ealpha00000000000000000000000a';
const MUSIC_BETA_ID = 'e2ebeta000000000000000000000000b';
const MUSIC_DELETED_ID = 'e2edeleted0000000000000000000000';

/** 全難易度を持つ楽曲。SP EXPERT にだけスコアがある */
const MUSIC_ALPHA = {
  musicId: MUSIC_ALPHA_ID,
  type: 0, // MUSIC_TYPE.NORMAL
  title: 'E2E Alpha',
  difficulty: [3, 7, 12, 15, 17, 8, 13, 16, 18],
  isDeleted: 0,
  containedVersion: 19,
};

/** CHALLENGE 譜面を持たない楽曲。スコアはない */
const MUSIC_BETA = {
  musicId: MUSIC_BETA_ID,
  type: 0,
  title: 'E2E Beta',
  difficulty: [2, 5, 9, 13, 0, 6, 10, 14, 0],
  isDeleted: 0,
  containedVersion: 18,
};

/** 削除済み楽曲。スコアがないので availability=2 となり、既定のフィルタで除外される */
const MUSIC_DELETED = {
  musicId: MUSIC_DELETED_ID,
  type: 0,
  title: 'E2E Deleted',
  difficulty: [1, 4, 8, 11, 0, 5, 9, 12, 0],
  isDeleted: 1,
  containedVersion: 12,
};

const MUSICS = {
  [MUSIC_ALPHA_ID]: MUSIC_ALPHA,
  [MUSIC_BETA_ID]: MUSIC_BETA,
  [MUSIC_DELETED_ID]: MUSIC_DELETED,
};

/** difficulty のキー 3 は Util.getDifficultyValue(SINGLE, EXPERT) */
const SCORES = {
  [MUSIC_ALPHA_ID]: {
    musicId: MUSIC_ALPHA_ID,
    musicType: 0,
    difficulty: {
      3: {
        score: 987650,
        scoreRank: 15, // SCORE_RANK.AA_PLUS
        clearType: 6, // CLEAR_TYPE.GREAT_FC
        playCount: 12,
        clearCount: 10,
        flareRank: 7, // FLARE_RANK.FLARE_7
        flareSkill: 1234,
        maxCombo: 456,
      },
    },
  },
};

/**
 * SP EXPERT の E2E Alpha が画面上でどう描画されるかの期待値。
 * ChartData の各 getter (scoreString / scoreRankString / flareRankSymbol など) の出力に対応する。
 */
const SCORED_CHART = {
  title: 'E2E Alpha',
  level: "15'", // levelString + playModeSymbol(SINGLE)
  clearCount: '10/',
  playCount: '12',
  flareRank: 'Ⅶ',
  flareRankClass: 'flare_7',
  flareSkill: '1234',
  scoreRank: 'AA+',
  scoreRankClass: 'rank_aa_p',
  fullCombo: '○',
  fullComboClass: 'great_fc',
  score: '987,650',
  maxCombo: '/456',
};

/** 既定のフィルタ (playMode=SP, availability=0) で描画されるはずの譜面 */
const EXPECTED_SINGLE_CHARTS = [
  { title: 'E2E Alpha', level: "3'" },
  { title: 'E2E Alpha', level: "7'" },
  { title: 'E2E Alpha', level: "12'" },
  { title: 'E2E Alpha', level: "15'" },
  { title: 'E2E Alpha', level: "17'" },
  { title: 'E2E Beta', level: "2'" },
  { title: 'E2E Beta', level: "5'" },
  { title: 'E2E Beta', level: "9'" },
  { title: 'E2E Beta', level: "13'" },
];

/** playMode を DP に切り替えたときに描画されるはずの譜面 */
const EXPECTED_DOUBLE_CHARTS = [
  { title: 'E2E Alpha', level: '8"' },
  { title: 'E2E Alpha', level: '13"' },
  { title: 'E2E Alpha', level: '16"' },
  { title: 'E2E Alpha', level: '18"' },
  { title: 'E2E Beta', level: '6"' },
  { title: 'E2E Beta', level: '10"' },
  { title: 'E2E Beta', level: '14"' },
];

/**
 * chrome.storage.local に投入するデータ一式を返す。
 *
 * internalStatus.musicListUpdatedAt を「今」にしているのは、popup が起動時に
 * 曲リストを再取得してフィクスチャを上書きしてしまうのを防ぐため
 * (browser_action/index.ts の refresh-chart-list ハンドラを参照)。
 */
function createStorageFixture(overrides = {}) {
  return {
    musics: MUSICS,
    scores: SCORES,
    internalStatus: { musicListUpdatedAt: Date.now() },
    ...overrides,
  };
}

module.exports = {
  MUSIC_ALPHA,
  MUSIC_BETA,
  MUSIC_DELETED,
  MUSICS,
  SCORES,
  SCORED_CHART,
  EXPECTED_SINGLE_CHARTS,
  EXPECTED_DOUBLE_CHARTS,
  createStorageFixture,
};
