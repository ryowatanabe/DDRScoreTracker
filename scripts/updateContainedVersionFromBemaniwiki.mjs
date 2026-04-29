import { createRequire } from 'module';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const { parseBemaniwikiHtml, normalizeTitle } = require('./bemaniwikiParser.js');
const { parseBemaniwikiOldSongsHtml } = require('./bemaniwikiOldSongsParser.js');
const { MUSIC_VERSION } = require('./musicVersionMap.cjs');

const __dirname = dirname(fileURLToPath(import.meta.url));

const NEW_SONGS_URL = 'https://bemaniwiki.com/?DanceDanceRevolution+WORLD/%E6%96%B0%E6%9B%B2%E3%83%AA%E3%82%B9%E3%83%88';
const OLD_SONGS_URL = 'https://bemaniwiki.com/?DanceDanceRevolution+WORLD/%E6%97%A7%E6%9B%B2%E3%83%AA%E3%82%B9%E3%83%88';
const MUSIC_LIST_PATHS = [join(__dirname, '../docs/musics/2.txt')];

const FIELD = {
  MUSIC_ID: 0,
  TYPE: 1,
  IS_DELETED: 2,
  DIFFICULTY_START: 3,
  DIFFICULTY_END: 12,
  TITLE: 12,
  CONTAINED_VERSION: 13,
  COUNT: 14,
};

// ---- ファイル操作 ----

function readMusicList(filePath) {
  const content = readFileSync(filePath, 'utf8');
  return content.split('\n').filter((line) => line.trim() !== '');
}

function parseLine(line) {
  const fields = line.split('\t');
  if (fields.length !== 13 && fields.length !== 14) return null;
  // 13 要素の旧形式は末尾に空欄を追加して 14 要素に正規化
  if (fields.length === 13) fields.push('');
  return { fields, title: fields[FIELD.TITLE] };
}

function buildLine(fields) {
  return fields.join('\t');
}

// ---- メイン処理 ----

async function main() {
  // 1. bemaniwiki から 2 ページ並列取得
  console.log('bemaniwiki からデータを取得中...');
  let newHtml, oldHtml;
  try {
    [newHtml, oldHtml] = await Promise.all([
      fetch(NEW_SONGS_URL).then((r) => {
        if (!r.ok) throw new Error(`新曲ページ HTTP ${r.status}`);
        return r.text();
      }),
      fetch(OLD_SONGS_URL).then((r) => {
        if (!r.ok) throw new Error(`旧曲ページ HTTP ${r.status}`);
        return r.text();
      }),
    ]);
  } catch (err) {
    console.error(`[ERROR] bemaniwiki の取得に失敗しました: ${err.message}`);
    process.exit(1);
  }

  // 2. パース
  const oldSongs = parseBemaniwikiOldSongsHtml(oldHtml);
  const newSongs = parseBemaniwikiHtml(newHtml);
  console.log(`旧曲ページ: ${oldSongs.length} 曲, 新曲ページ: ${newSongs.length} 曲`);

  // 3. title → version の Map を構築 (旧曲優先: 旧曲ページの方が古いバージョンを示す)
  const titleToVersion = new Map();
  for (const { title, version } of oldSongs) {
    if (version !== null) titleToVersion.set(title, version);
  }
  for (const { title } of newSongs) {
    if (!titleToVersion.has(title)) {
      titleToVersion.set(title, MUSIC_VERSION.DDR_WORLD);
    }
  }
  console.log(`バージョン情報: ${titleToVersion.size} 曲`);

  // 4. 各楽曲リストファイルを処理
  for (const filePath of MUSIC_LIST_PATHS) {
    let lines;
    try {
      lines = readMusicList(filePath);
    } catch (err) {
      console.error(`[ERROR] ${filePath} の読み込みに失敗しました: ${err.message}`);
      continue;
    }

    const updatedLines = [];
    const updateReport = [];
    const conflictReport = [];
    const unmatchedWiki = [];
    const nullVersionTitles = [];

    // docs/musics に存在するが wiki に無い曲を後で検出するため、wiki 側タイトルセットを使う
    const docsTitles = new Set();

    for (const line of lines) {
      const parsed = parseLine(line);
      if (!parsed) {
        updatedLines.push(line);
        continue;
      }

      const normalizedTitle = normalizeTitle(parsed.title);
      docsTitles.add(normalizedTitle);
      const newVersion = titleToVersion.get(normalizedTitle);
      const existingVersionStr = parsed.fields[FIELD.CONTAINED_VERSION];

      if (newVersion === undefined) {
        // wiki に存在しない楽曲 → そのまま保持 (warn は後でまとめて)
        if (existingVersionStr === '') nullVersionTitles.push(parsed.title);
        updatedLines.push(buildLine(parsed.fields));
        continue;
      }

      const existingVersion = existingVersionStr !== '' ? parseInt(existingVersionStr, 10) : null;

      if (existingVersion !== null && existingVersion !== newVersion) {
        // 既存値と新値が異なる場合は警告のみ、上書きしない
        conflictReport.push({ title: parsed.title, existingVersion, newVersion });
        updatedLines.push(buildLine(parsed.fields));
        continue;
      }

      if (existingVersion === null) {
        // 未設定 → 新値を書き込み
        parsed.fields[FIELD.CONTAINED_VERSION] = String(newVersion);
        updatedLines.push(buildLine(parsed.fields));
        updateReport.push({ title: parsed.title, version: newVersion });
      } else {
        // 既存値と一致 → 変更なし
        updatedLines.push(buildLine(parsed.fields));
      }
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
        writeFileSync(filePath, updatedLines.join('\n') + '\n', 'utf8');
      } catch (err) {
        console.error(`[ERROR] ${filePath} の書き込みに失敗しました: ${err.message}`);
        continue;
      }
    }

    // 6. レポート出力
    const shortPath = filePath.replace(__dirname + '/../', '');
    const totalLines = updatedLines.filter((line) => line.split('\t').length === FIELD.COUNT).length;
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
