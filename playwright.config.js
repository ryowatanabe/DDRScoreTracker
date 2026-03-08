// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

const pathToExtension = path.join(__dirname, 'dist');

/**
 * Playwright configuration for DDRScoreTracker Chrome Extension E2E tests.
 *
 * Prerequisites:
 *   1. Run `yarn build:dev` to build the extension into ./dist
 *   2. Run `yarn test:e2e` to execute the tests
 *
 * The extension is loaded into a persistent Chromium context using
 * launchPersistentContext with --load-extension flag.
 *
 * CI Note: Use --headless=new (set via HEADLESS env var) for headless runs.
 *
 * @see https://playwright.dev/docs/chrome-extensions
 */
module.exports = defineConfig({
  testDir: './test-e2e',
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium-extension',
      use: {
        ...devices['Desktop Chrome'],
        // Chrome extension tests must use launchPersistentContext
        // and cannot use the standard browser launch
      },
    },
  ],
});
