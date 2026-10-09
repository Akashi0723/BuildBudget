import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  workers: 2,
  use: {
    baseURL: 'http://127.0.0.1:3100',
    launchOptions: { executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] },
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 3100',
    url: 'http://127.0.0.1:3100',
    env: { BUILDBUDGET_DATA_DIR: '/tmp/buildbudget-e2e', BUILDBUDGET_NEXT_DIST_DIR: '.next-e2e' },
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
