import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';

const isCI = !! process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? '100%' : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['allure-playwright', { outputFolder: 'allure-results', detail: true, suiteTitle: true }],
  ],

  use: {
    baseURL: env.BASE_URL,
    headless: env.HEADLESS,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },

  projects: [
    // API-only tests: no browser needed, so they run once regardless of the browser matrix.
    {
      name: 'api',
      testDir: './tests/api',
      use: {},
    },
    {
      name: 'chromium',
      testDir: './tests',
      testIgnore: ['**/api/**'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testDir: './tests',
      testIgnore: ['**/api/**'],
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testDir: './tests',
      testIgnore: ['**/api/**'],
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
