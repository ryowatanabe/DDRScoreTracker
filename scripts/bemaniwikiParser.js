'use strict';

const { JSDOM } = require('jsdom');

/**
 * bemaniwiki の新曲リストページに含まれる難易度テーブルかどうか判定する。
 * 判定基準: 1行目のテキストに "SINGLE" と "DOUBLE" が含まれること。
 * @param {Element} table
 * @returns {boolean}
 */
function isMainDifficultyTable(table) {
  const firstRow = table.querySelector('tr');
  if (!firstRow) return false;
  const text = firstRow.textContent;
  return text.includes('SINGLE') && text.includes('DOUBLE');
}

/**
 * 難易度セルのテキストを数値に変換する。
 * "-" / "--" は未収録を表すため 0 を返す。
 * "[SA]" などのプレフィックスは除去する。
 * @param {string} cellText
 * @returns {number}
 */
function parseDifficultyValue(cellText) {
  const text = cellText
    .replace(/\[SA\]/g, '') // SAVIOR Attack マーカー除去
    .replace(/\[\*\d+\]/g, '') // 脚注マーカー除去
    .trim();
  if (text === '' || text === '-' || text === '--') return 0;
  const n = parseInt(text, 10);
  return isNaN(n) ? 0 : n;
}

/**
 * 曲名を正規化する。
 * - 脚注マーカー ([*1] 等) を除去
 * - 全角文字を半角に変換 (NFKC 正規化)
 * - 空白を整理
 * @param {string} title
 * @returns {string}
 */
function normalizeTitle(title) {
  return title
    .replace(/\[\*\d+\]/g, '') // 脚注マーカー除去
    .normalize('NFKC') // 全角→半角
    .replace(/\s+/g, ' ') // 空白の正規化
    .trim();
}

/**
 * bemaniwiki の新曲リストページ HTML を解析し、曲名と難易度情報の一覧を返す。
 *
 * 返り値の difficulties 配列は以下のインデックスに対応する:
 *   [0] bSP (SP Beginner)
 *   [1] BSP (SP Basic)
 *   [2] DSP (SP Difficult)
 *   [3] ESP (SP Expert)
 *   [4] CSP (SP Challenge)
 *   [5] BDP (DP Basic)
 *   [6] DDP (DP Difficult)
 *   [7] EDP (DP Expert)
 *   [8] CDP (DP Challenge)
 *
 * @param {string} htmlString
 * @returns {{ title: string, difficulties: number[] }[]}
 */
function parseBemaniwikiHtml(htmlString) {
  const dom = new JSDOM(htmlString);
  const doc = dom.window.document;
  const tables = doc.querySelectorAll('table');

  const songs = [];

  for (const table of tables) {
    if (!isMainDifficultyTable(table)) continue;

    const rows = table.querySelectorAll('tr');

    // 最初の2行はヘッダー行 (配信日/分類/曲名... + Be/Ba/Di/Ex/Ch/Ba/Di/Ex/Ch) なのでスキップ
    for (let i = 2; i < rows.length; i++) {
      const cells = Array.from(rows[i].querySelectorAll('td'));

      // データ行の最小セル数は 13 (曲名 + BPM + MV + 難易度9つ)
      // それ未満はカテゴリ区切り行のためスキップ
      if (cells.length < 13) continue;

      // 曲名のインデックスを決定:
      //   16セル: date[0] + 分類[1] + 曲名[2] + アーティスト + 出典 + BPM + MV + 難易度9つ
      //   15セル: 分類[0] + 曲名[1] + アーティスト + 出典 + BPM + MV + 難易度9つ
      //   13セル: 分類[0] + 曲名[1] + BPM + MV + 難易度9つ (アーティスト/出典が上行の rowspan で覆われている)
      const titleIndex = cells.length >= 16 ? 2 : 1;
      const rawTitle = cells[titleIndex].textContent.trim();
      const title = normalizeTitle(rawTitle);

      if (!title) continue;

      // 末尾 9 セルが常に難易度値 (bSP, BSP, DSP, ESP, CSP, BDP, DDP, EDP, CDP)
      const diffCells = cells.slice(cells.length - 9);
      const difficulties = diffCells.map((c) => parseDifficultyValue(c.textContent));

      songs.push({ title, difficulties });
    }
  }

  return songs;
}

module.exports = { parseBemaniwikiHtml, normalizeTitle };
