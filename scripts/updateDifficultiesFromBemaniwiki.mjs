import { createRequire } from 'module';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { MusicData } from '../src/static/common/MusicData.js';
import { MusicList } from '../src/static/common/MusicList.js';

const require = createRequire(import.meta.url);
const { parseBemaniwikiHtml, normalizeTitle } = require('./bemaniwikiParser.js');

const __dirname = dirname(fileURLToPath(import.meta.url));

const BEMANIWIKI_URL = 'https://bemaniwiki.com/?DanceDanceRevolution+WORLD/%E6%96%B0%E6%9B%B2%E3%83%AA%E3%82%B9%E3%83%88';
const MUSIC_LIST_PATH = join(__dirname, '../docs/musics/3.txt');

const DIFFICULTY_NAMES = ['bSP', 'BSP', 'DSP', 'ESP', 'CSP', 'BDP', 'DDP', 'EDP', 'CDP'];

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

  // 3. 楽曲リストを読み込み
  const fileContent = readFileSync(MUSIC_LIST_PATH, 'utf8');
  const musicList = new MusicList();
  for (const line of fileContent.split(/\r?\n/)) {
    if (line.trim() === '') continue;
    const md = MusicData.createFromString(line);
    if (md === null) {
      console.error(`[ERROR] 不正な行があります: ${line}`);
      process.exit(1);
    }
    musicList.musics[md.musicId] = md;
  }

  // 4. title → MusicData の Map を構築
  const titleToMusicData = new Map();
  for (const id of musicList.musicIds) {
    const md = musicList.musics[id];
    const normalized = normalizeTitle(md.title);
    if (normalized) titleToMusicData.set(normalized, md);
  }
  console.log(`楽曲リスト: ${musicList.musicIds.length} 曲読み込み`);

  // 5. 突合・更新
  const updateReport = [];
  const unmatchedTitles = [];
  const conflictReport = [];

  for (const wikiSong of wikiSongs) {
    const md = titleToMusicData.get(wikiSong.title);

    if (md === undefined) {
      unmatchedTitles.push(wikiSong.title);
      continue;
    }

    // 値の食い違いを警告として記録 (上書きしない)
    const conflicts = [];
    for (let i = 0; i < 9; i++) {
      if (md.difficulty[i] !== 0 && wikiSong.difficulties[i] !== 0 && md.difficulty[i] !== wikiSong.difficulties[i]) {
        conflicts.push({ name: DIFFICULTY_NAMES[i], localValue: md.difficulty[i], remoteValue: wikiSong.difficulties[i] });
      }
    }
    if (conflicts.length > 0) {
      conflictReport.push({ title: wikiSong.title, conflicts });
    }

    // 0 の箇所のみ更新
    const updates = [];
    for (let i = 0; i < 9; i++) {
      if (md.difficulty[i] === 0 && wikiSong.difficulties[i] !== 0) {
        md.difficulty[i] = wikiSong.difficulties[i];
        updates.push({ name: DIFFICULTY_NAMES[i], oldValue: 0, newValue: wikiSong.difficulties[i] });
      }
    }
    if (updates.length > 0) {
      updateReport.push({ title: wikiSong.title, updates });
    }
  }

  // 6. ファイル書き戻し
  if (updateReport.length > 0) {
    try {
      writeFileSync(MUSIC_LIST_PATH, musicList.encodedString + '\n', 'utf8');
    } catch (err) {
      console.error(`[ERROR] 楽曲リストの書き込みに失敗しました: ${err.message}`);
      process.exit(1);
    }
  }

  // 7. レポート出力
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
