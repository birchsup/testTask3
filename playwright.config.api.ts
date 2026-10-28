import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

// Pick the environment file by TEST_ENV; only prod exists today (.env.prod).
const TEST_ENV = process.env.TEST_ENV ?? 'prod';
dotenv.config({ path: `.env.${TEST_ENV}`, quiet: true });

const API_BASE_URL = process.env.API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error(`API_BASE_URL is not set: expected it in .env.${TEST_ENV} or the environment`);
}

export default defineConfig({
  use: {
    baseURL: API_BASE_URL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      // Mirror the browser so the request looks like the real UI client.
      Origin: 'https://app.debridge.com',
      Referer: 'https://app.debridge.com/',
    },
  },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,

  retries: 0,
  workers: process.env.PW_WORKERS ? Number(process.env.PW_WORKERS) : 5,

  timeout: 20_000,
  expect: { timeout: 5_000 },

  reporter: process.env.PW_BLOB
    ? [['blob']]
    : [
        ['list'],
        ['html', { outputFolder: 'playwright-report-api', open: 'never' }],
        ['json', { outputFile: 'playwright-report/report-api.json' }],
      ],

  metadata: {
    env: TEST_ENV,
    project: 'testTask3-API',
  },

  projects: [
    { name: 'contract', testDir: './src/tests/contract' },
    { name: 'e2e', testDir: './src/tests/e2e' },
  ],
});
