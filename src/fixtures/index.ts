import { mergeTests, test as base } from '@playwright/test';
import { apiTest } from './api-fixtures';
import { pageTest } from './page-fixtures';
import { logUiAction } from '../utils/logger';

const loggingTest = base.extend<{ autoLog: void }>({
  autoLog: [
    async ({}, use, testInfo) => {
      logUiAction(`START ${testInfo.titlePath.join(' > ')}`);
      await use();
      logUiAction(`END ${testInfo.titlePath.join(' > ')} - ${testInfo.status ?? 'unknown'}`);
    },
    { auto: true },
  ],
});

/**
 * Single entry point for every spec file: merges the API fixtures, the Page
 * Object fixtures, and an auto-logging fixture into one `test`. This is the
 * "Hybrid POM + Fixtures" pattern - specs only ever import from here.
 */
export const test = mergeTests(apiTest, pageTest, loggingTest);
export { expect } from '@playwright/test';
