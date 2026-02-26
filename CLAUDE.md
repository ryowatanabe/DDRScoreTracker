# DDRScoreTracker - Claude Project Guide

## Project Overview

Chrome Extension (Manifest V3) that collects and tracks DanceDanceRevolution scores from the DDR World official website. Built with Vue 3, webpack, and Jest.

- **Version**: 0.4.0
- **Node requirement**: >=18.12.0

## Commands

```bash
yarn build:dev          # Development build (webpack, NODE_ENV=development)
yarn build              # Production build (includes NODE_OPTIONS=--openssl-legacy-provider + clean)
yarn test               # Run Jest tests
yarn test -- --testPathPattern=Parser   # Run specific test file
yarn lint               # ESLint (flat config)
yarn prettier:write     # Format all src/**/*.{js,vue,json,html} and test/**/*.js
yarn clean              # Remove dist/
```

> Always use `yarn build` (not direct webpack) — the script sets `NODE_OPTIONS=--openssl-legacy-provider` required for the build.

## Architecture & Data Flow

```
Vue (browser_action UI)
  → App.js          (orchestrates all operations)
  → BrowserController.js  (tab/messaging abstraction)
  → ContentScript         (injected into DDR World pages)
  → Parser.js       (parses HTML into structured data)
  → Storage.js      (chrome.storage.local CRUD)
  → Vue             (re-renders updated state)
```

## Key Files

| File | Path |
|------|------|
| App.js | `src/static/common/App.js` |
| Parser.js | `src/static/common/Parser.js` |
| Constants.js | `src/static/common/Constants.js` |
| Storage.js | `src/static/common/Storage.js` |
| BrowserController.js | `src/static/common/BrowserController.js` |
| i18n (en) | `src/static/_locales/en/messages.json` |
| i18n (ja) | `src/static/_locales/ja/messages.json` |
| Tests | `test/` |
| Fixture HTML | `test/` (HTML snapshots for Parser tests) |

## Coding Conventions

- **Classes**: PascalCase
- **Methods/variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Prettier**: single quotes, print width 180, trailing commas (ES5)
- **No npm** — always use `yarn`

## Game Domain Constants (src/static/common/Constants.js)

```javascript
GAME_VERSION: { A20PLUS: 0, A3: 1, WORLD: 2 }

PLAY_MODE: { SINGLE: 0, DOUBLE: 1 }

DIFFICULTY: { BEGINNER: 0, BASIC: 1, DIFFICULT: 2, EXPERT: 3, CHALLENGE: 4 }

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
```

## Critical Rules

1. **i18n**: When adding any user-visible string, update **both** `en/messages.json` and `ja/messages.json`.

2. **Parser.js snapshots**: Changes to `Parser.js` will affect snapshot tests. Run `yarn test` and review any updated snapshots before committing.

3. **Chrome Extension constraints**:
   - Cannot use `fetch` or XHR directly from content scripts in all contexts
   - Use `chrome.storage.local` (not localStorage) for persistence
   - Background runs as a Service Worker (no DOM access, limited lifetime)
   - Message passing via `chrome.runtime.sendMessage` / `chrome.tabs.sendMessage`

## Testing

- **Framework**: Jest 29
- **Snapshot tests**: Parser output is snapshot-tested against fixture HTML files
- **Run single test**: `yarn test -- --testPathPattern=Parser`
- **Update snapshots**: `yarn test -- --updateSnapshot`
- Fixture HTML files live in `test/` directory alongside test files
