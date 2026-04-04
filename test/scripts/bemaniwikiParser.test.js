/**
 * @jest-environment node
 */

const fs = require('fs');
const path = require('path');
const { parseBemaniwikiHtml, normalizeTitle } = require('../../scripts/bemaniwikiParser');

// ---- normalizeTitle ----

test('normalizeTitle: 脚注マーカーを除去する', () => {
  expect(normalizeTitle('きゅうくらりん[*1]')).toBe('きゅうくらりん');
  expect(normalizeTitle('Fly With Me[*12]')).toBe('Fly With Me');
});

test('parseBemaniwikiHtml: note_super 注釈が曲名に残らない', () => {
  const songs = parseBemaniwikiHtml(html);
  const titles = songs.map((s) => s.title);
  // note_super タグ由来の *N が除去されていること
  expect(titles).toContain('Timepiece phase II');
  expect(titles).not.toContain('Timepiece phase II*7');
  expect(titles).toContain('羽根亡キ少女唄');
  expect(titles).not.toContain('羽根亡キ少女唄*8');
});

test('normalizeTitle: 全角英数を半角に変換する', () => {
  expect(normalizeTitle('Ａ')).toBe('A');
  expect(normalizeTitle('１２３')).toBe('123');
});

test('normalizeTitle: 余分な空白を整理する', () => {
  expect(normalizeTitle('  foo   bar  ')).toBe('foo bar');
  expect(normalizeTitle('foo\u3000bar')).toBe('foo bar'); // 全角スペース
});

test('normalizeTitle: 脚注・全角・空白を組み合わせて正規化する', () => {
  expect(normalizeTitle('  Ｓｏｎｇ  Ｎａｍｅ[*2]  ')).toBe('Song Name');
});

// ---- parseBemaniwikiHtml (フィクスチャ使用) ----

const html = fs.readFileSync(path.resolve(path.join(__dirname, 'fixtures/bemaniwiki-new-songs.html')), 'utf8');

test('parseBemaniwikiHtml: 1曲以上パースできる', () => {
  const songs = parseBemaniwikiHtml(html);
  expect(songs.length).toBeGreaterThan(0);
});

test('parseBemaniwikiHtml: 各エントリが title と difficulties[9] を持つ', () => {
  const songs = parseBemaniwikiHtml(html);
  for (const song of songs) {
    expect(typeof song.title).toBe('string');
    expect(song.title.length).toBeGreaterThan(0);
    expect(Array.isArray(song.difficulties)).toBe(true);
    expect(song.difficulties).toHaveLength(9);
    for (const d of song.difficulties) {
      expect(typeof d).toBe('number');
      expect(d).toBeGreaterThanOrEqual(0);
    }
  }
});

test('parseBemaniwikiHtml: 難易度なし ("--" / "-") は 0 になる', () => {
  const songs = parseBemaniwikiHtml(html);
  // 全ての難易度値が 0 以上の整数であること (NaN が混入していないこと)
  for (const song of songs) {
    for (const d of song.difficulties) {
      expect(Number.isInteger(d)).toBe(true);
      expect(d).toBeGreaterThanOrEqual(0);
    }
  }
});

test('parseBemaniwikiHtml: [SA] プレフィックスが除去された数値になる', () => {
  const songs = parseBemaniwikiHtml(html);
  // [SA] プレフィックスが残っていれば parseInt が NaN になり 0 になる。
  // 該当曲 "粛聖!! ロリ神レクイエム☆" の CSP が 12 になることを確認
  const song = songs.find((s) => s.title === '粛聖!! ロリ神レクイエム☆');
  expect(song).toBeDefined();
  // CSP = index 4, CDP = index 8
  expect(song.difficulties[4]).toBe(12); // [SA]12 → 12
  expect(song.difficulties[8]).toBe(12); // [SA]12 → 12
});

test('parseBemaniwikiHtml: rowspan で配信日が省略された行も正しくパースされる', () => {
  const songs = parseBemaniwikiHtml(html);
  // 2024/06/12 にまとめて配信された曲のうち、きゅうくらりん以外 (rowspan の後続行) も存在すること
  const titles = songs.map((s) => s.title);
  expect(titles).toContain('きゅうくらりん');
  expect(titles).toContain('強風オールバック');
});

test('parseBemaniwikiHtml: スナップショット', () => {
  const songs = parseBemaniwikiHtml(html);
  expect(songs).toMatchSnapshot();
});
