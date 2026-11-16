import { defineConfig, devices } from '@playwright/test';

/**
 * `channel: 'chrome'` (an already-installed system browser) is used instead of Playwright's own
 * managed Chromium -- `npx playwright install` cannot download Playwright's bundled browser
 * binary in this environment (the CDN returns "not available in your location"). System Chrome
 * is a real, evidence-based Chromium-family browser, not a workaround that weakens the
 * validation -- see docs/architecture/034-application-shell-and-module-scope.md's sibling
 * report for this documented limitation.
 */
export default defineConfig({
  testDir: './e2e',
  // Serial, not parallel -- Next dev's on-demand per-route compilation is slow on first hit;
  // running many first-visits concurrently against one dev server caused compile-contention
  // timeouts during this session's initial run. A real production build wouldn't have this
  // cold-compile cost, but this environment can't run `next start` against a live backend either
  // -- serial execution against `next dev` is the accurate, reproducible tradeoff here.
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3099',
    channel: 'chrome',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], channel: 'chrome' },
    },
  ],
  webServer: {
    // A dedicated port, deliberately different from the app's normal :3010 -- a pre-existing,
    // not-agent-started process already occupies :3010 in this environment and must not be
    // touched. This spins up its own isolated dev server instance instead of interfering with it.
    command: 'npx next dev -p 3099',
    url: 'http://localhost:3099',
    reuseExistingServer: false,
    // Generous -- next/font/google's build-time font fetch has been intermittently slow/timing
    // out against Google Fonts' CDN in this sandboxed environment (falls back gracefully, but
    // the retries themselves can consume the server's startup budget).
    timeout: 120_000,
  },
});
