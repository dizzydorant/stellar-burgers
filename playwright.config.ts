import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  testMatch: ['*.{spec,test,pl}.{ts,tsx}', '**/*.{spec,test,pl}.{ts,tsx}'],

  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4000',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
