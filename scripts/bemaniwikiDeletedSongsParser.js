'use strict';

const { JSDOM } = require('jsdom');
const { ANCHOR_ID_TO_VERSION, DELETED_LIST_HEADING_TO_VERSION } = require('./musicVersionMap.cjs');
const { normalizeTitle } = require('./bemaniwikiParser.js');

/**
 * bemaniwiki 削除曲リストページの「全削除曲リスト」表のみを解析し、
 * 曲名と初出バージョンの一覧を返す。
 *
 * セクション区切りは colspan="7" の行で判定する。
 * DDR X3 以降は <a class="anchor" id="ACxxx"> によるアンカー ID も付与されており、
 * アンカー ID がある場合は ANCHOR_ID_TO_VERSION で、ない場合はテキストを NFKC 正規化して
 * DELETED_LIST_HEADING_TO_VERSION で currentVersion を決定する。
 * いずれにもマッチしない行 (DDR Solo 等) は currentVersion = null のままとする。
 *
 * @param {string} htmlString
 * @returns {{ title: string, version: number | null }[]}
 */
function parseBemaniwikiDeletedSongsHtml(htmlString) {
  const dom = new JSDOM(htmlString);
  const doc = dom.window.document;

  doc.querySelectorAll('a.note_super').forEach((el) => el.remove());

  // id="all_delete_list" アンカーを含む h3 の直後にある table.style_table を取得する
  const allDeleteAnchor = doc.querySelector('#all_delete_list');
  if (!allDeleteAnchor) return [];

  // アンカーは h3 の内側にあるので、親 h3 (または div.jumpmenu を挟む場合も含め) の後続兄弟を探す
  let sibling = allDeleteAnchor.closest('h3')?.nextElementSibling;
  let table = null;
  while (sibling) {
    table = sibling.querySelector('table.style_table') ?? (sibling.matches('table.style_table') ? sibling : null);
    if (table) break;
    sibling = sibling.nextElementSibling;
  }
  if (!table) return [];

  const songs = [];
  let currentVersion = null;

  for (const row of table.querySelectorAll('tbody tr')) {
    const cells = Array.from(row.querySelectorAll('td'));
    if (cells.length === 0) continue;

    const firstCell = cells[0];
    const colspanAttr = firstCell.getAttribute('colspan');

    if (colspanAttr === '7') {
      // セクション区切り行: アンカー ID → テキストの順で判定
      const anchor = firstCell.querySelector('a.anchor[id]');
      if (anchor) {
        const id = anchor.getAttribute('id');
        currentVersion = ANCHOR_ID_TO_VERSION[id] ?? null;
      } else {
        const text = firstCell.textContent.normalize('NFKC').replace(/\s+/g, ' ').trim();
        currentVersion = DELETED_LIST_HEADING_TO_VERSION[text] ?? null;
      }
      continue;
    }

    // 楽曲行: 7 セル必要 (分類/曲名/アーティスト/出典/BPM/AC収録/CS収録)
    if (cells.length < 7) continue;

    const rawTitle = cells[1].textContent.trim();
    const title = normalizeTitle(rawTitle);
    if (!title) continue;

    songs.push({ title, version: currentVersion });
  }

  return songs;
}

module.exports = { parseBemaniwikiDeletedSongsHtml };
