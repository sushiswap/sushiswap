import type { PlaywrightTestConfig } from '@playwright/test'
import { devices } from '@playwright/test'
import { defineConfig } from 'next/experimental/testmode/playwright.js'

// Use process.env.PORT by default and fallback to port 3000
const PORT = process.env.PORT || 3000

// Set webServer.url and use.baseURL with the location of the WebServer respecting the correct set port
const baseURL = `http://localhost:${PORT}`

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  quiet: !!process.env.CI,
  testMatch: [
    'pool.test.ts',
    // 'simple.test.ts',
    // 'smart.test.ts',
    // 'cross-chain.test.ts',
  ],
  testIgnore: [],
  /* Maximum time one test can run for. Defaults to 30s. */
  timeout: 180_000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    // timeout: 10_000,
    timeout: 180_000,
  },
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  // Retry on CI only.
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  // workers: process.env.CI ? 4 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? 'github' : 'list',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    headless: !process.env.CI ? false : true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'off',
    colorScheme: 'dark',

    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    // actionTimeout: 0,

    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',
  },
  globalSetup: './global.setup.ts',
  globalTeardown: './global.teardown.ts',

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //   },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: {
    //     ...devices['iPhone 12'],
    //   },
    // },
  ],
  maxFailures: process.env.CI ? 1 : 0,
  // Run your local dev server before starting the tests:
  // https://playwright.dev/docs/test-advanced#launching-a-development-web-server-during-the-tests
  webServer: [
    // {
    //   command: [
    //     'anvil',
    //     `--fork-block-number=${process.env.ANVIL_BLOCK_NUMBER}`,
    //     `--fork-url=${process.env.ANVIL_FORK_URL}`,
    //     `--port=${Number(process.env.ANVIL_PORT || 8545)}`,
    //     // '--host=127.0.0.1',
    //     // '--no-mining',
    //     '--silent',
    //     // '--block-time 15',
    //   ].join(' '),
    //   port: Number(process.env.ANVIL_PORT || 8545),
    //   timeout: 120_000,
    //   // reuseExistingServer: !process.env.CI,
    //   env: {
    //     ANVIL_BLOCK_NUMBER: String(process.env.ANVIL_BLOCK_NUMBER),
    //     ANVIL_FORK_URL: String(process.env.ANVIL_FORK_URL),
    //     ANVIL_PORT: String(process.env.ANVIL_PORT || 8545),
    //   },
    //   // stderr: 'pipe',
    //   // stdout: 'pipe',
    // },
    {
      command: [
        `EDGE_CONFIG=${String(process.env.EDGE_CONFIG)}`,
        'NEXT_PUBLIC_APP_ENV=test',
        `NEXT_PUBLIC_CHAIN_ID=${String(process.env.NEXT_PUBLIC_CHAIN_ID)}`,
        'npm run start',
      ].join(' '),
      port: 3000,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      env: {
        EDGE_CONFIG: String(process.env.EDGE_CONFIG),
        NEXT_PUBLIC_APP_ENV: 'test',
        NEXT_PUBLIC_CHAIN_ID: String(process.env.NEXT_PUBLIC_CHAIN_ID),
      },
      // stderr: 'pipe',
      // stdout: 'pipe',
    },
  ],
}

export default defineConfig(config)
