'use strict';

const { JSDOM } = require('jsdom');
const { ANCHOR_ID_TO_VERSION } = require('./musicVersionMap.cjs');
const { normalizeTitle } = require('./bemaniwikiParser.js');

/**
 * bemaniwiki 旧曲リストページ HTML を解析し、曲名と収録バージョンの一覧を返す。
 *
 * バージョンはセクション見出し行の <a class="anchor" id="ACxxxx"> から決定する。
 * セクション切替前の行はスキップ (currentVersion = null) する。
 *
 * @param {string} htmlString
 * @returns {{ title: string, version: number | null }[]}
 */
function parseBemaniwikiOldSongsHtml(htmlString) {
  const dom = new JSDOM(htmlString);
  const doc = dom.window.document;

  doc.querySelectorAll('a.note_super').forEach((el) => el.remove());

  const tables = doc.querySelectorAll('table.style_table');
  const songs = [];

  for (const table of tables) {
    let currentVersion = null;
    const rows = table.querySelectorAll('tr');
    // rowspan 状態: 各論理列が今後何行占有されているかを保持
    const colOccupied = [];

    for (const row of rows) {
      // アンカー ID を持つ行はバージョンセクション切替行
      const anchor = row.querySelector('a.anchor[id]');
      if (anchor) {
        const anchorId = anchor.getAttribute('id');
        currentVersion = ANCHOR_ID_TO_VERSION[anchorId] ?? null;
        continue;
      }

      // rowspan/colspan を考慮して論理セル配列を組み立てる
      const cells = Array.from(row.querySelectorAll('td'));
      // ヘッダ行 (<th> のみ) は <td> が 0 個。分類+曲名の 2 列は rowspan なしで全行に存在するため
      // 最低 2 セルないと楽曲行ではない
      if (cells.length < 2) continue;
      const logicalCells = [];
      let cellIdx = 0;
      let c = 0;
      while (cellIdx < cells.length) {
        // 前行の rowspan に占有されている列はスキップ
        while (colOccupied[c] > 0) {
          logicalCells[c] = null;
          colOccupied[c]--;
          c++;
        }
        const td = cells[cellIdx++];
        const colspan = parseInt(td.getAttribute('colspan') || '1', 10);
        const rowspan = parseInt(td.getAttribute('rowspan') || '1', 10);
        for (let k = 0; k < colspan; k++) {
          logicalCells[c + k] = td;
          if (rowspan > 1) colOccupied[c + k] = rowspan - 1;
        }
        c += colspan;
      }
      // 全セルを消費した後も、rowspan が残っている列を当該行でデクリメントする。
      // 例: artist/source が rowspan=3 で BPM も rowspan=2 の場合、Type C / TYPE3 行は
      // <td> が 2 個しかなく上記 while が c=2 で終了するが、colOccupied[2..] はまだ残っている。
      for (let i = c; i < colOccupied.length; i++) {
        if (colOccupied[i] > 0) colOccupied[i]--;
      }

      // 旧曲リストの列構成: 分類[0] 曲名[1] アーティスト[2] 出典[3] BPM[4] MV[5] 難易度×9
      // 分類・曲名列は rowspan なしで全行に存在するため cells[1] = 曲名セル
      const rawTitle = cells[1].textContent.trim();
      const title = normalizeTitle(rawTitle);
      if (!title) continue;

      songs.push({ title, version: currentVersion });
    }
  }

  return songs;
}

module.exports = { parseBemaniwikiOldSongsHtml };
