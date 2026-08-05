# DDRScoreTracker - Claude Project Guide

## Project Overview

Chrome Extension (Manifest V3) that collects and tracks DanceDanceRevolution scores from the DDR World official website. Built with **TypeScript**, Vue 3, webpack, and Jest.

- **Version**: `package.json` の `version` を参照（ここには書かない。リリースのたびに陳腐化するため）
- **Node requirement**: >=24.0.0 (`package.json` の `engines`)
- **Package manager**: Yarn 4.x (Berry)

## Commands

```bash
yarn build:dev          # Development build (tsc --noEmit + webpack, NODE_ENV=development)
yarn build              # Production build (clean + tsc --noEmit + webpack。NODE_OPTIONS=--openssl-legacy-provider 付き)
yarn test               # Run Jest tests
yarn test Parser        # Run specific test file (位置引数。最も簡潔)
yarn test --updateSnapshot   # Update Jest snapshots
yarn test:e2e           # Playwright E2E（要 `yarn build:dev`。ブラウザは自動で用意される）
yarn lint               # ESLint (flat config)
yarn prettier           # 整形結果を stdout に出すだけ (チェックでも書き換えでもない)
yarn prettier:write     # Format src/**/*.{js,ts,vue,json,html} and test/**/*.js
yarn prettier:check     # 整形されているかを検査するだけ (CI が実行する)
yarn package            # 配布用 zip を作成 (scripts/packageExtension.mjs)
yarn update-difficulties        # BEMANIWiki から難易度データを更新
yarn update-contained-version   # BEMANIWiki から収録バージョンを更新
yarn clean              # Remove dist/
```

> **`yarn test` に `--` を付けないこと**: Yarn Berry では `--` がそのまま jest に渡され、
> テストパスパターンとして解釈される（`Pattern: --updateSnapshot - 0 matches` となり
> **オプションが無視されたまま成功したように見える**）。
> `yarn test -- --updateSnapshot` はスナップショットを更新しない。

> **`--testPathPattern` は使えない**: jest 30 で `--testPathPatterns`（複数形）に改名された。
> 旧名を渡すと 0 件マッチで終わる。位置引数の `yarn test Parser` を使うのが安全。

> Always use `yarn build` (not direct webpack) — the script sets `NODE_OPTIONS=--openssl-legacy-provider` required for the build.

> **Yarn Berry (corepack 必須)**: このプロジェクトは Yarn 4.x (Berry) を使用。初回セットアップ時は `corepack enable` を実行すること。`npm i -g yarn` でインストールした Yarn Classic が PATH にある場合は事前に削除すること。

## Architecture & Data Flow

```
Vue (browser_action UI)
  → App.ts          (orchestrates all operations)
  → BrowserController.ts  (tab/messaging abstraction)
  → ContentScript         (injected into DDR World pages)
  → Parser.ts       (parses HTML into structured data)
  → Storage.ts      (chrome.storage.local CRUD)
  → Vue             (re-renders updated state)
```

`src/` はほぼ全面 TypeScript 化済み。UI コンポーネントのみ `.vue`。
JavaScript のまま残っているのは `src/static/common/i18n4html.js` /
`src/options_ui/index.js` / `src/static/browser_action/debug/browser-controller.js` の 3 ファイルのみ。

## Key Files

| File | Path |
|------|------|
| App.ts | `src/static/common/App.ts` |
| Parser.ts | `src/static/common/Parser.ts` |
| Constants.ts | `src/static/common/Constants.ts` |
| Storage.ts | `src/static/common/Storage.ts` |
| BrowserController.ts | `src/static/common/BrowserController.ts` |
| manifest | `src/manifest.json` |
| i18n (en) | `src/static/_locales/en/messages.json` |
| i18n (ja) | `src/static/_locales/ja/messages.json` |
| Unit tests | `test/` |
| Fixture HTML | `test/common/Parser/fixtures/`, `test/scripts/fixtures/` |
| E2E tests | `test-e2e/` (Playwright) |
| CI | `.github/workflows/ci.yml` |
| Yarn 設定 | `.yarnrc.yml` |
| Dependabot 設定 | `.github/dependabot.yml` |

## Coding Conventions

- **Classes**: PascalCase
- **Methods/variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Prettier**: single quotes, print width 180, trailing commas (ES5)
- **No npm** — always use `yarn`

> **整形は prettier、lint は eslint と役割を分ける**: `eslint.config.mjs` に整形系のルールは
> 入れない（`eslint-plugin-prettier` / `eslint-config-prettier` は使わないので devDependencies
> にも入っていない）。整形は `yarn prettier:write` と lint-staged が担当し、CI は
> `yarn prettier:check` で検査する。glob は `src/**/*.{js,ts,vue,json,html}` と `test/**/*.js`。

## Game Domain Constants (src/static/common/Constants.ts)

すべて `Constants` クラスの static getter。

```typescript
GAME_VERSION: { A20PLUS: 0, A3: 1, WORLD: 2 }

PLAY_MODE: { SINGLE: 0, DOUBLE: 1 }

MUSIC_TYPE: { UNKNOWN: -1, NORMAL: 0, NONSTOP: 1, GRADE: 2, GRADE_PLUS: 3, GRADE_A3: 4 }

// 名前は複数形の DIFFICULTIES。DIFFICULTY ではない
DIFFICULTIES: { BEGINNER: 0, BASIC: 1, DIFFICULT: 2, EXPERT: 3, CHALLENGE: 4 }

CLEAR_TYPE: {
  NO_PLAY: 0, FAILED: 1, ASSIST_CLEAR: 2, CLEAR: 3, LIFE4: 4,
  GOOD_FC: 5, GREAT_FC: 6, PERFECT_FC: 7, MARVELOUS_FC: 8
}

SCORE_RANK: {
  NO_PLAY: 0, E: 1, D: 2, D_PLUS: 3,
  C_MINUS: 4, C: 5, C_PLUS: 6,
  B_MINUS: 7, B: 8, B_PLUS: 9,
  A_MINUS: 10, A: 11, A_PLUS: 12,
  AA_MINUS: 13, AA: 14, AA_PLUS: 15, AAA: 16
}

FLARE_RANK: { NONE: 0, FLARE_1: 1, ... FLARE_9: 9, FLARE_EX: 10 }
```

`MUSIC_VERSION`（DDR シリーズの初収録バージョン）は `GAME_VERSION`（eagate の対象シリーズ）とは
別概念。値を追加した場合は `MusicVersion` 型と `scripts/musicVersionMap.cjs` も合わせて更新すること。

## manifest.json 設計メモ

- `unlimitedStorage`: MV3 では非推奨だが意図的に残している。スコア・楽曲リスト・差分履歴の蓄積により chrome.storage.local のデフォルト上限 10MB を超えるリスクがあるため。
- `http://skillattack.com/`: skillattack.com が HTTPS 非対応のため http のまま。
- `version` は `null`。ビルド時に `package.json` から注入する。

## 依存関係の運用方針

「常に 14 日遅れの最新を取る」。サプライチェーン攻撃対策として、公開直後のバージョンは取り込まない。

| 設定 | 役割 |
|---|---|
| `.yarnrc.yml` の `npmMinimalAgeGate: 14d` | install 時の強制力。手動の `yarn up` や security update PR にも効く |
| `.github/dependabot.yml` の `cooldown: 14` | version update PR を作らせないための入口側の制御 |

**両者の値は必ず揃えること。** 揃っていないと、Dependabot が作った PR が
`npmMinimalAgeGate` に弾かれて `yarn install` に失敗する。

緊急 CVE 等で 14 日待てない場合のみ `.yarnrc.yml` の `npmPreapprovedPackages` に例外を追加し、
解禁日を過ぎたら削除する別 PR を作ること。

## CI (.github/workflows/ci.yml)

PR と master への push で 2 ジョブを並列実行する。

| ジョブ | 内容 |
|---|---|
| `verify` | `yarn install --immutable` → `prettier:check` → `lint` → `tsc --noEmit` → `test` → `build` |
| `e2e` | `playwright install --with-deps chromium` → `build:dev` → `test:e2e`。失敗時のみ `test-results/`（trace）を artifact に残す |

## Critical Rules

1. **i18n**: When adding any user-visible string, update **both** `en/messages.json` and `ja/messages.json`.

2. **Parser.ts snapshots**: Changes to `Parser.ts` will affect snapshot tests. Run `yarn test` and review any updated snapshots before committing.

3. **依存更新の 14 日ゲート**: `.yarnrc.yml` の `npmMinimalAgeGate` と `.github/dependabot.yml` の `cooldown` は必ず同じ値に保つこと。

4. **Chrome Extension constraints**:
   - Cannot use `fetch` or XHR directly from content scripts in all contexts
   - Use `chrome.storage.local` (not localStorage) for persistence
   - Background runs as a Service Worker (no DOM access, limited lifetime)
   - Message passing via `chrome.runtime.sendMessage` / `chrome.tabs.sendMessage`

## Testing

- **Framework**: Jest 30（ユニット）/ Playwright（E2E）
- **Snapshot tests**: Parser output is snapshot-tested against fixture HTML files
- **Run single test**: `yarn test Parser`（`--` を付けない。上の Commands の注記を参照）
- **Update snapshots**: `yarn test --updateSnapshot`
- Unit tests live in `test/`; fixture HTML files live in the `fixtures/` directory alongside each test
- E2E tests live in `test-e2e/`。`yarn build:dev` で `dist/` を作ってから `yarn test:e2e`
- **E2E のブラウザ起動方法は変えないこと**: MV3 の Service Worker は `channel: 'chromium'`
  （＝chromium 本体）でないと検出できず、chrome-headless-shell では取得できない。
  生の `--headless` / `--headless=new` を引数で渡すのも禁止（Chrome 側の実装変更で
  起動ごとクラッシュした前例がある → #692）。目視したいときは `HEADED=1 yarn test:e2e`
