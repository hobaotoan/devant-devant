import { defineConfig } from '@playwright/test'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment: TEST_ENV=ae bun --bun playwright test → env.ae
const env = process.env.TEST_ENV || 'dev'
config({ path: resolve(__dirname, `env.${env}`) })

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: '50%',
  // Surface flakiness locally (0); auto-retry in CI (2) where reruns are cheap.
  retries: process.env.CI ? 2 : 0,
  // Fail CI if anyone left `test.only` in the suite.
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    channel: 'chrome',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'default', use: {} },
  ],
})
