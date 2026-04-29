import { createRequire } from 'module';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const { parseBemaniwikiHtml, normalizeTitle } = require('./bemaniwikiParser.js');

const __dirname = dirname(fileURLToPath(import.meta.url));

const BEMANIWIKI_URL = 'https://bemaniwiki.com/?DanceDanceRevolution+WORLD/%E6%96%B0%E6%9B%B2%E3%83%AA%E3%82%B9%E3%83%88';
const MUSIC_LIST_PATH = join(__dirname, '../docs/musics/2.txt');

// docs/musics/2.txt のフィールド定義 (MusicData.ts と同一)
const FIELD = {
  MUSIC_ID: 0,
  TYPE: 1,
  IS_DELETED: 2,
  DIFFICULTY_START: 3, // difficulty[0..8] = fields[3..11]
  DIFFICULTY_END: 12, // exclusive
  TITLE: 12,
  COUNT: 13,
};

const DIFFICULTY_NAMES = ['bSP', 'BSP', 'DSP', 'ESP', 'CSP', 'BDP', 'DDP', 'EDP', 'CDP'];

// ---- 楽曲リストの読み込み・書き込み ----

function readMusicList(filePath) {
  const content = readFileSync(filePath, 'utf8');
  return content.split('\n').filter((line) => line.trim() !== '');
}

function parseLine(line) {
  const fields = line.split('\t');
  if (fields.length !== FIELD.COUNT && fields.length !== FIELD.COUNT + 1) return null;
  return {
    fields,
    title: fields[FIELD.TITLE],
    difficulties: fields.slice(FIELD.DIFFICULTY_START, FIELD.DIFFICULTY_END).map(Number),
  };
}

function buildLine(fields, difficulties) {
  const updated = [...fields];
  for (let i = 0; i < 9; i++) {
    updated[FIELD.DIFFICULTY_START + i] = String(difficulties[i]);
  }
  return updated.join('\t');
}

// ---- 突合・更新ロジック ----

function mergeDifficulties(local, remote) {
  const result = [...local];
  const updates = [];
  for (let i = 0; i < 9; i++) {
    if (local[i] === 0 && remote[i] !== 0) {
      result[i] = remote[i];
      updates.push({ index: i, name: DIFFICULTY_NAMES[i], oldValue: 0, newValue: remote[i] });
    }
  }
  return { merged: result, updates };
}

function detectConflicts(title, local, remote) {
  const conflicts = [];
  for (let i = 0; i < 9; i++) {
    if (local[i] !== 0 && remote[i] !== 0 && local[i] !== remote[i]) {
      conflicts.push({ name: DIFFICULTY_NAMES[i], localValue: local[i], remoteValue: remote[i] });
    }
  }
  return conflicts;
}

// ---- メイン処理 ----

async function main() {
  // 1. bemaniwiki から HTML を取得
  console.log(`bemaniwiki からデータを取得中: ${BEMANIWIKI_URL}`);
  let html;
  try {
    const res = await fetch(BEMANIWIKI_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    html = await res.text();
  } catch (err) {
    console.error(`[ERROR] bemaniwiki の取得に失敗しました: ${err.message}`);
    process.exit(1);
  }

  // 2. HTML をパース
  const wikiSongs = parseBemaniwikiHtml(html);
  console.log(`bemaniwiki から ${wikiSongs.length} 曲取得`);

  // 3. 楽曲リストを読み込み、曲名 → 行インデックスの Map を構築
  let lines;
  try {
    lines = readMusicList(MUSIC_LIST_PATH);
  } catch (err) {
    console.error(`[ERROR] 楽曲リストの読み込みに失敗しました: ${err.message}`);
    process.exit(1);
  }

  const titleToIndex = new Map();
  for (let i = 0; i < lines.length; i++) {
    const parsed = parseLine(lines[i]);
    if (!parsed) continue;
    const normalized = normalizeTitle(parsed.title);
    if (normalized) titleToIndex.set(normalized, i);
  }
  console.log(`楽曲リスト: ${lines.length} 曲読み込み`);

  // 4. 突合・更新
  const updatedLines = [...lines];
  const updateReport = [];
  const unmatchedTitles = [];
  const conflictReport = [];

  for (const wikiSong of wikiSongs) {
    const idx = titleToIndex.get(wikiSong.title);

    if (idx === undefined) {
      unmatchedTitles.push(wikiSong.title);
      continue;
    }

    const parsed = parseLine(lines[idx]);
    if (!parsed) continue;

    // 値の食い違いを警告として記録
    const conflicts = detectConflicts(wikiSong.title, parsed.difficulties, wikiSong.difficulties);
    if (conflicts.length > 0) {
      conflictReport.push({ title: wikiSong.title, conflicts });
    }

    // 0 の箇所のみ更新
    const { merged, updates } = mergeDifficulties(parsed.difficulties, wikiSong.difficulties);
    if (updates.length > 0) {
      updatedLines[idx] = buildLine(parsed.fields, merged);
      updateReport.push({ title: wikiSong.title, updates });
    }
  }

  // 5. ファイル書き戻し
  if (updateReport.length > 0) {
    try {
      writeFileSync(MUSIC_LIST_PATH, updatedLines.join('\n') + '\n', 'utf8');
    } catch (err) {
      console.error(`[ERROR] 楽曲リストの書き込みに失敗しました: ${err.message}`);
      process.exit(1);
    }
  }

  // 6. レポート出力
  console.log('\n========== 更新結果 ==========');
  console.log(`更新した曲: ${updateReport.length} 曲`);
  if (updateReport.length > 0) {
    for (const { title, updates } of updateReport) {
      const detail = updates.map(({ name, oldValue, newValue }) => `${name}: ${oldValue}→${newValue}`).join(', ');
      console.log(`  [更新] ${title} (${detail})`);
    }
  }

  if (conflictReport.length > 0) {
    console.log(`\n[警告] bemaniwiki と楽曲リストで値が異なる箇所 (更新されません): ${conflictReport.length} 曲`);
    for (const { title, conflicts } of conflictReport) {
      const detail = conflicts.map(({ name, localValue, remoteValue }) => `${name}: local=${localValue}, wiki=${remoteValue}`).join(', ');
      console.log(`  [警告] ${title} (${detail})`);
    }
  }

  if (unmatchedTitles.length > 0) {
    console.log(`\nマッチしなかった bemaniwiki の曲 (手動確認が必要): ${unmatchedTitles.length} 曲`);
    for (const title of unmatchedTitles) {
      console.log(`  [未マッチ] ${title}`);
    }
  }

  console.log('\n完了');
}

main();
