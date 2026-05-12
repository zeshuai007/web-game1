import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45000,
  expect: { timeout: 15000 },
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  // Disable auto-start — run dev server manually before tests
  // webServer: {
  //   command: 'DB_CONNECTION_STRING="postgresql://localhost:5433/xianni_game" npx nuxt dev --port 3000',
  //   port: 3000,
  //   timeout: 30000,
  //   reuseExistingServer: true,
  // },
})
