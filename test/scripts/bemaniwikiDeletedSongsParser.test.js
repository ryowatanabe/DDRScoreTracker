/**
 * @jest-environment node
 */

const fs = require('fs');
const path = require('path');
const { parseBemaniwikiDeletedSongsHtml } = require('../../scripts/bemaniwikiDeletedSongsParser');
const { MUSIC_VERSION } = require('../../scripts/musicVersionMap.cjs');

const html = fs.readFileSync(path.join(__dirname, 'fixtures/bemaniwiki-deleted-songs.html'), 'utf8');

test('パース結果がタイトルとバージョンの配列を返す', () => {
  const songs = parseBemaniwikiDeletedSongsHtml(html);
  expect(Array.isArray(songs)).toBe(true);
  expect(songs.length).toBeGreaterThan(0);
  for (const song of songs) {
    expect(typeof song.title).toBe('string');
    expect(song.title.length).toBeGreaterThan(0);
  }
});

test('DDR 1st セクション (テキスト区切り) の曲が DDR_1ST バージョンに割り当てられる', () => {
  const songs = parseBemaniwikiDeletedSongsHtml(html);
  const butterfly = songs.find((s) => s.title === 'Butterfly');
  expect(butterfly).toBeDefined();
  expect(butterfly.version).toBe(MUSIC_VERSION.DDR_1ST);
});

test('DDR 1st セクション内の複数曲が正しくパースされる', () => {
  const songs = parseBemaniwikiDeletedSongsHtml(html);
  const song = songs.find((s) => s.title === 'KUNG FU FIGHTING');
  expect(song).toBeDefined();
  expect(song.version).toBe(MUSIC_VERSION.DDR_1ST);
});

test('ACA3 アンカー付きセクションの曲が DDR_A3 バージョンに割り当てられる', () => {
  const songs = parseBemaniwikiDeletedSongsHtml(html);
  const song = songs.find((s) => s.title === 'ミックスナッツ');
  expect(song).toBeDefined();
  expect(song.version).toBe(MUSIC_VERSION.DDR_A3);
});

test('今回削除曲リストのテーブル (5列) の曲は結果に含まれない', () => {
  const songs = parseBemaniwikiDeletedSongsHtml(html);
  const playHard = songs.find((s) => s.title === 'Play Hard');
  expect(playHard).toBeUndefined();
});

test('DDR Solo など MUSIC_VERSION 対象外のセクション曲は version=null になる', () => {
  const songs = parseBemaniwikiDeletedSongsHtml(html);
  // フィクスチャでは DDR Solo セクションはヘッダー行のみで曲行なし
  // このテストは DDR Solo の後に曲がないことを確認する (スコープ外セクションの扱い)
  const songsAfterA3 = songs.filter((s) => s.version === null);
  // DDR A3 より後に DDR Solo が来るが曲がないため空配列になるはず
  expect(songsAfterA3.length).toBe(0);
});

test('全削除曲リストテーブルが見つからない場合は空配列を返す', () => {
  const result = parseBemaniwikiDeletedSongsHtml('<html><body></body></html>');
  expect(result).toEqual([]);
});

test('パース結果のスナップショット', () => {
  const songs = parseBemaniwikiDeletedSongsHtml(html);
  expect(songs).toMatchSnapshot();
});
