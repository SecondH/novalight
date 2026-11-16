import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';

/**
 * Browser-rendered evidence pass -- captures real pixels (not code-level review) for the
 * bilingual rebuild, per the mandate's Phase 9. Screenshots are written outside the repository
 * (session scratchpad), referenced by the final report. Honest scope note: this environment has
 * no live database/Clerk test-user credentials, so "authenticated product page" evidence here
 * is the real, verifiable *access-boundary* behavior (an unauthenticated visitor to a dashboard
 * route is redirected to /sign-in), not a fabricated populated-dashboard screenshot.
 */
const SHOT_DIR =
  'C:/Users/MR05EA~1.HAJ/AppData/Local/Temp/claude/D--novalight/c5874c95-f08d-4f5a-b665-46116d98bcf1/scratchpad/screenshots';

/**
 * Clerk's client SDK fetches its environment config and hydrates asynchronously -- this
 * session's first screenshot pass captured the pre-hydration state (missing header auth
 * buttons, a blank sign-in card) because it didn't wait for this. Waiting for Clerk's own
 * `<UserButton>`/auth-control render is more reliable than a fixed sleep.
 */
async function waitForClerkReady(page: Page) {
  // `.textContent` (not `.innerText`) deliberately -- on mobile, the signed-out auth buttons
  // live inside a closed <details> drawer, which `.innerText` excludes (no layout box) but
  // `.textContent` still finds, since the DOM node exists whether or not the drawer is open.
  // Note: this resolves almost instantly (the header's plain-text button renders well before
  // any Clerk widget hydrates) -- it only confirms the *header controls* rendered, not a full
  // <SignIn>/<SignUp> widget. Use `waitForClerkWidget` on pages that embed the actual widget.
  await page.waitForFunction(
    () =>
      document.querySelector('.cl-rootBox, .cl-userButtonTrigger, .cl-formButtonPrimary') !==
        null ||
      (document.body.textContent ?? '').includes('Sign in') ||
      (document.body.textContent ?? '').includes('ورود'),
    undefined,
    { timeout: 10_000 },
  );
}

/**
 * The embedded <SignIn>/<SignUp> widget takes ~2s to fetch its environment config from Clerk
 * and mount `.cl-rootBox` -- confirmed by direct measurement during this session (1.9s). A
 * fixed short wait or a generic "some sign-in text exists" check (see `waitForClerkReady`)
 * both under-wait for this specific case, since the header's own plain-text button resolves in
 * under 50ms and would otherwise satisfy a looser check before the real widget has rendered.
 */
async function waitForClerkWidget(page: Page) {
  await page.waitForSelector('.cl-rootBox', { timeout: 15_000 });
  await page.waitForSelector('.cl-formButtonPrimary, input[name="identifier"]', {
    timeout: 15_000,
  });
}

test.describe('Landing page', () => {
  test('fa desktop/mobile', async ({ page }, testInfo) => {
    await page.goto('/fa');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
    await waitForClerkReady(page);
    await page.screenshot({
      path: path.join(SHOT_DIR, `01-landing-fa-${testInfo.project.name}.png`),
      fullPage: true,
    });
  });

  test('en desktop/mobile', async ({ page }, testInfo) => {
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await waitForClerkReady(page);
    await page.screenshot({
      path: path.join(SHOT_DIR, `02-landing-en-${testInfo.project.name}.png`),
      fullPage: true,
    });
  });
});

test.describe('Sign-in / Sign-up', () => {
  test('fa sign-in', async ({ page }, testInfo) => {
    await page.goto('/fa/sign-in');
    await waitForClerkWidget(page);
    await page.screenshot({
      path: path.join(SHOT_DIR, `05-sign-in-fa-${testInfo.project.name}.png`),
      fullPage: true,
    });
  });

  test('en sign-up', async ({ page }, testInfo) => {
    await page.goto('/en/sign-up');
    await waitForClerkWidget(page);
    await page.screenshot({
      path: path.join(SHOT_DIR, `06-sign-up-en-${testInfo.project.name}.png`),
      fullPage: true,
    });
  });
});

test.describe('Onboarding (redirects to sign-in when unauthenticated -- real, verifiable boundary)', () => {
  test('brand-setup fa', async ({ page }, testInfo) => {
    await page.goto('/fa/brand-setup');
    await page.waitForURL(/\/fa\/sign-in/);
    await waitForClerkWidget(page);
    await page.screenshot({
      path: path.join(SHOT_DIR, `07-brand-setup-redirect-fa-${testInfo.project.name}.png`),
      fullPage: true,
    });
  });
});

test.describe('Access boundary', () => {
  test('dashboard route redirects to sign-in (fa)', async ({ page }, testInfo) => {
    await page.goto('/fa/content');
    await page.waitForURL(/\/fa\/sign-in/);
    await waitForClerkWidget(page);
    await page.screenshot({
      path: path.join(SHOT_DIR, `09-dashboard-redirect-fa-${testInfo.project.name}.png`),
      fullPage: true,
    });
  });

  test('dashboard route redirects to sign-in (en)', async ({ page }, testInfo) => {
    await page.goto('/en/calendar');
    await page.waitForURL(/\/en\/sign-in/);
    await waitForClerkWidget(page);
    await page.screenshot({
      path: path.join(SHOT_DIR, `10-dashboard-redirect-en-${testInfo.project.name}.png`),
      fullPage: true,
    });
  });
});

test.describe('Locale switching', () => {
  test('switching locale persists via cookie and navigates to the fa-prefixed URL (desktop inline switcher)', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'desktop',
      'the inline switcher is desktop-only >= sm; see mobile-drawer test below',
    );
    await page.goto('/en');
    await waitForClerkReady(page);
    await page.getByRole('button', { name: 'فارسی' }).click();
    await page.waitForURL(/\/fa$/);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('switching locale from inside the mobile drawer', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile-drawer-only interaction check');
    await page.goto('/en');
    await waitForClerkReady(page);
    // `getByRole('button')` doesn't reliably map a bare <summary> to role=button across engines
    // -- using the element directly, which is what a real user/assistive tech actually clicks.
    await page.locator('summary[aria-label="Open navigation menu"]').click();
    // Two "Language" groups exist in the DOM (the >= sm inline copy, hidden but present at
    // mobile widths, and the drawer copy) -- `.last()` is the drawer's, the one actually visible.
    await page.locator('[role="group"][aria-label="Language"]').last().getByText('فارسی').click();
    await page.waitForURL(/\/fa$/);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });
});

test.describe('Mobile navigation', () => {
  test('mobile menu drawer opens and shows marketing links, locale switcher, and auth controls', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile-only interaction check');
    await page.goto('/en');
    await waitForClerkReady(page);
    await page.locator('summary[aria-label="Open navigation menu"]').click();
    await expect(page.getByRole('link', { name: 'How it works' }).last()).toBeVisible();
    await expect(page.locator('[role="group"][aria-label="Language"]').last()).toBeVisible();
    await page.screenshot({
      path: path.join(SHOT_DIR, `11-mobile-nav-open-${testInfo.project.name}.png`),
      fullPage: true,
    });
  });
});
