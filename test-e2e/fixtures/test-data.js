/**
 * Fixture data for Playwright E2E tests.
 *
 * This module exports pre-built chrome.storage.local data that can be
 * injected into the extension during tests via page.evaluate().
 */

'use strict';

/**
 * Minimal music list entry encoded for storage.
 * These represent parsed MusicData objects in their storage format.
 */
const MUSIC_LIST_ENTRIES = [
  {
    musicId: 'test001',
    title: 'Test Song Alpha',
    artist: 'Test Artist',
    bpm: '180',
    levels: { 1: 10, 2: 14, 3: 16, 4: 18 },
    musicType: 0,
  },
  {
    musicId: 'test002',
    title: 'Test Song Beta',
    artist: 'Another Artist',
    bpm: '140',
    levels: { 1: 8, 2: 12, 3: 15, 4: null },
    musicType: 0,
  },
];

/**
 * Minimal score data for a single chart.
 * Mirrors the ScoreData storage format.
 */
const SCORE_ENTRIES = [
  {
    musicId: 'test001',
    playMode: 0,
    difficulty: 3,
    score: 980000,
    clearType: 3,
    flareRank: 5,
    flareSkill: 1234,
    maxCombo: 280,
    clearCount: 5,
    playCount: 10,
  },
  {
    musicId: 'test002',
    playMode: 0,
    difficulty: 2,
    score: 850000,
    clearType: 3,
    flareRank: 3,
    flareSkill: 900,
    maxCombo: 200,
    clearCount: 2,
    playCount: 4,
  },
];

/**
 * Build a storage payload suitable for injection via chrome.storage.local.set().
 * Keys follow the convention used by Storage.js.
 */
function buildStoragePayload() {
  return {
    musicList: JSON.stringify(MUSIC_LIST_ENTRIES),
    scoreData: JSON.stringify(SCORE_ENTRIES),
    options: JSON.stringify({
      gameVersion: 2,
      enableDebugLog: false,
      language: 'en',
    }),
  };
}

module.exports = { MUSIC_LIST_ENTRIES, SCORE_ENTRIES, buildStoragePayload };
