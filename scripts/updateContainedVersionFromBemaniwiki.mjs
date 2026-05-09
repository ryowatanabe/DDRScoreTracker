import { createRequire } from 'module';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Constants } from '../src/static/common/Constants.js';
import { MusicData } from '../src/static/common/MusicData.js';
import { MusicList } from '../src/static/common/MusicList.js';

const require = createRequire(import.meta.url);
const { parseBemaniwikiNewSongTitles, normalizeTitle } = require('./bemaniwikiParser.js');
const { parseBemaniwikiOldSongsHtml } = require('./bemaniwikiOldSongsParser.js');
const { parseBemaniwikiDeletedSongsHtml } = require('./bemaniwikiDeletedSongsParser.js');

const __dirname = dirname(fileURLToPath(import.meta.url));

const MUSIC_VERSION = Constants.MUSIC_VERSION;

const NEW_SONGS_URL = 'https://bemaniwiki.com/?DanceDanceRevolution+WORLD/%E6%96%B0%E6%9B%B2%E3%83%AA%E3%82%B9%E3%83%88';
const OLD_SONGS_URL = 'https://bemaniwiki.com/?DanceDanceRevolution+WORLD/%E6%97%A7%E6%9B%B2%E3%83%AA%E3%82%B9%E3%83%88';
const DELETED_SONGS_URL = 'https://bemaniwiki.com/?DanceDanceRevolution+WORLD/%E5%89%8A%E9%99%A4%E6%9B%B2%E3%83%AA%E3%82%B9%E3%83%88';
const MUSIC_LIST_PATHS = [join(__dirname, '../docs/musics/3.txt')];

// ---- メイン処理 ----

async function main() {
  // 1. bemaniwiki から 3 ページ並列取得
  console.log('bemaniwiki からデータを取得中...');
  let newHtml, oldHtml, deletedHtml;
  try {
    [newHtml, oldHtml, deletedHtml] = await Promise.all([
      fetch(NEW_SONGS_URL).then((r) => {
        if (!r.ok) throw new Error(`新曲ページ HTTP ${r.status}`);
        return r.text();
      }),
      fetch(OLD_SONGS_URL).then((r) => {
        if (!r.ok) throw new Error(`旧曲ページ HTTP ${r.status}`);
        return r.text();
      }),
      fetch(DELETED_SONGS_URL).then((r) => {
        if (!r.ok) throw new Error(`削除曲ページ HTTP ${r.status}`);
        return r.text();
      }),
    ]);
  } catch (err) {
    console.error(`[ERROR] bemaniwiki の取得に失敗しました: ${err.message}`);
    process.exit(1);
  }

  // 2. パース
  const oldSongs = parseBemaniwikiOldSongsHtml(oldHtml);
  const newSongTitles = parseBemaniwikiNewSongTitles(newHtml);
  const deletedSongs = parseBemaniwikiDeletedSongsHtml(deletedHtml);
  console.log(`旧曲ページ: ${oldSongs.length} 曲, 新曲ページ: ${newSongTitles.length} 曲, 削除曲ページ: ${deletedSongs.length} 曲`);

  // 3. title → version の Map を構築 (新曲 > 旧曲 > 削除曲 の優先順位)
  const titleToVersion = new Map();
  for (const { title, version } of deletedSongs) {
    if (version !== null) titleToVersion.set(title, version);
  }
  for (const { title, version } of oldSongs) {
    if (version !== null) titleToVersion.set(title, version);
  }
  for (const title of newSongTitles) {
    titleToVersion.set(title, MUSIC_VERSION.DDR_WORLD);
  }
  console.log(`バージョン情報: ${titleToVersion.size} 曲`);

  // 4. 各楽曲リストファイルを処理
  for (const filePath of MUSIC_LIST_PATHS) {
    let fileContent;
    try {
      fileContent = readFileSync(filePath, 'utf8');
    } catch (err) {
      console.error(`[ERROR] ${filePath} の読み込みに失敗しました: ${err.message}`);
      continue;
    }

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

    const updateReport = [];
    const conflictReport = [];
    const unmatchedWiki = [];
    const nullVersionTitles = [];
    const docsTitles = new Set();

    for (const id of musicList.musicIds) {
      const md = musicList.musics[id];
      const normalizedTitle = normalizeTitle(md.title);
      docsTitles.add(normalizedTitle);
      const newVersion = titleToVersion.get(normalizedTitle);
      const existingVersion = md.containedVersion;

      if (newVersion === undefined) {
        // wiki に存在しない楽曲 → そのまま保持
        if (existingVersion === null) nullVersionTitles.push(md.title);
        continue;
      }

      if (existingVersion !== null && existingVersion !== newVersion) {
        // 既存値と新値が異なる場合は警告のみ、上書きしない
        conflictReport.push({ title: md.title, existingVersion, newVersion });
        continue;
      }

      if (existingVersion === null) {
        // 未設定 → 新値を書き込み
        md.containedVersion = newVersion;
        updateReport.push({ title: md.title, version: newVersion });
      }
      // else: 既存値と一致 → 変更なし
    }

    // wiki にあるが docs に無い曲
    for (const [title] of titleToVersion) {
      if (!docsTitles.has(title)) {
        unmatchedWiki.push(title);
      }
    }

    // 5. ファイル書き戻し
    if (updateReport.length > 0) {
      try {
        writeFileSync(filePath, musicList.encodedString + '\n', 'utf8');
      } catch (err) {
        console.error(`[ERROR] ${filePath} の書き込みに失敗しました: ${err.message}`);
        continue;
      }
    }

    // 6. レポート出力
    const shortPath = filePath.replace(__dirname + '/../', '');
    const totalLines = musicList.musicIds.length;
    console.log(`\n========== ${shortPath} ==========`);
    console.log(`更新した曲: ${updateReport.length} 曲`);
    console.log(`バージョン未設定のまま: ${nullVersionTitles.length} / ${totalLines} 曲`);
    if (updateReport.length > 0) {
      for (const { title, version } of updateReport) {
        console.log(`  [更新] ${title} → version=${version}`);
      }
    }
    if (conflictReport.length > 0) {
      console.log(`\n[警告] 既存値と wiki の値が異なるため更新をスキップ: ${conflictReport.length} 曲`);
      for (const { title, existingVersion, newVersion } of conflictReport) {
        console.log(`  [競合] ${title} (既存=${existingVersion}, wiki=${newVersion})`);
      }
    }
    if (nullVersionTitles.length > 0) {
      console.log(`\n[未設定] wiki に存在せずバージョン未設定のまま: ${nullVersionTitles.length} 曲`);
      for (const title of nullVersionTitles) {
        console.log(`  [未設定] ${title}`);
      }
    }
    if (unmatchedWiki.length > 0) {
      console.log(`\n[情報] wiki にあるが ${shortPath} に存在しない曲: ${unmatchedWiki.length} 曲`);
      for (const title of unmatchedWiki) {
        console.log(`  [wiki only] ${title}`);
      }
    }
  }

  console.log('\n完了');
}

main();
