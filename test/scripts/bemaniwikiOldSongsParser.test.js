/**
 * @jest-environment node
 */

const fs = require('fs');
const path = require('path');
const { parseBemaniwikiOldSongsHtml } = require('../../scripts/bemaniwikiOldSongsParser');
const { MUSIC_VERSION } = require('../../scripts/musicVersionMap.cjs');

const html = fs.readFileSync(path.join(__dirname, 'fixtures/bemaniwiki-old-songs.html'), 'utf8');

test('パース結果がタイトルとバージョンの配列を返す', () => {
  const songs = parseBemaniwikiOldSongsHtml(html);
  expect(Array.isArray(songs)).toBe(true);
  expect(songs.length).toBeGreaterThan(0);
  for (const song of songs) {
    expect(typeof song.title).toBe('string');
    expect(song.title.length).toBeGreaterThan(0);
  }
});

test('AC1st セクション内の曲が DDR_1ST バージョンに割り当てられる', () => {
  const songs = parseBemaniwikiOldSongsHtml(html);
  const song = songs.find((s) => s.title === 'Make It Better');
  expect(song).toBeDefined();
  expect(song.version).toBe(MUSIC_VERSION.DDR_1ST);
});

test('AC1st セクション内の複数曲が正しくパースされる', () => {
  const songs = parseBemaniwikiOldSongsHtml(html);
  const makeItMove = songs.find((s) => s.title === 'MAKE IT MOVE');
  expect(makeItMove).toBeDefined();
  expect(makeItMove.version).toBe(MUSIC_VERSION.DDR_1ST);
});

test('ACMAX セクション内の曲が DDRMAX バージョンに割り当てられる', () => {
  const songs = parseBemaniwikiOldSongsHtml(html);
  const max300 = songs.find((s) => s.title === 'MAX 300');
  expect(max300).toBeDefined();
  expect(max300.version).toBe(MUSIC_VERSION.DDRMAX);
});

test('note_super 注釈が曲名に残らない', () => {
  const songs = parseBemaniwikiOldSongsHtml(html);
  const titles = songs.map((s) => s.title);
  expect(titles).toContain('PARANOiA Rebirth');
  expect(titles.some((t) => t.includes('*1'))).toBe(false);
});

test('ACA3 セクション内の曲が DDR_A3 バージョンに割り当てられる', () => {
  const songs = parseBemaniwikiOldSongsHtml(html);
  const song = songs.find((s) => s.title === 'ENDYMION');
  expect(song).toBeDefined();
  expect(song.version).toBe(MUSIC_VERSION.DDR_A3);
});

test('rowspan 先頭行 (Type A) の曲が正しいバージョンに割り当てられる', () => {
  const songs = parseBemaniwikiOldSongsHtml(html);
  const song = songs.find((s) => s.title === 'New York EVOLVED (Type A)');
  expect(song).toBeDefined();
  expect(song.version).toBe(MUSIC_VERSION.DDR_X3);
});

test('rowspan 継続行 (Type B) の曲が正しいバージョンに割り当てられる', () => {
  const songs = parseBemaniwikiOldSongsHtml(html);
  const song = songs.find((s) => s.title === 'New York EVOLVED (Type B)');
  expect(song).toBeDefined();
  expect(song.version).toBe(MUSIC_VERSION.DDR_X3);
});

test('rowspan 継続行 (Type C) の曲が正しいバージョンに割り当てられる', () => {
  const songs = parseBemaniwikiOldSongsHtml(html);
  const song = songs.find((s) => s.title === 'New York EVOLVED (Type C)');
  expect(song).toBeDefined();
  expect(song.version).toBe(MUSIC_VERSION.DDR_X3);
});

test('パース結果のスナップショット', () => {
  const songs = parseBemaniwikiOldSongsHtml(html);
  expect(songs).toMatchSnapshot();
});
