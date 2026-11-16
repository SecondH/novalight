import { NextRequest } from 'next/server';
import { vi } from 'vitest';

// This suite only exercises `isPublicRoute`'s matcher logic, not the intl middleware itself
// (that's next-intl's own, already-tested behavior). Mocked out because `next-intl/middleware`'s
// ESM build imports `next/server` in a way plain Vitest (outside Next's own bundler) can't
// resolve -- a module-resolution quirk, not a defect in this file's logic.
vi.mock('next-intl/middleware', () => ({
  default: () => () => undefined,
}));

import { isPublicRoute } from './middleware';

function requestFor(path: string) {
  return new NextRequest(new URL(path, 'http://localhost:3010'));
}

describe('isPublicRoute', () => {
  it('treats the bare root (pre-locale-redirect) as public', () => {
    expect(isPublicRoute(requestFor('/'))).toBe(true);
  });

  it('treats the localized marketing home page as public', () => {
    expect(isPublicRoute(requestFor('/fa'))).toBe(true);
    expect(isPublicRoute(requestFor('/en'))).toBe(true);
  });

  it('treats sign-in and its sub-routes as public, per locale', () => {
    expect(isPublicRoute(requestFor('/fa/sign-in'))).toBe(true);
    expect(isPublicRoute(requestFor('/fa/sign-in/factor-one'))).toBe(true);
    expect(isPublicRoute(requestFor('/en/sign-in'))).toBe(true);
  });

  it('treats sign-up and its sub-routes as public, per locale', () => {
    expect(isPublicRoute(requestFor('/fa/sign-up'))).toBe(true);
    expect(isPublicRoute(requestFor('/en/sign-up'))).toBe(true);
  });

  it('treats every other route as protected by default', () => {
    expect(isPublicRoute(requestFor('/fa/brand-setup'))).toBe(false);
    expect(isPublicRoute(requestFor('/en/some-future-dashboard-page'))).toBe(false);
  });

  it('does not treat a route that merely starts with "sign-in"/"sign-up" as public', () => {
    // Regression test for a Medium-severity finding from an independent security review
    // (2026-07-14): the original `(.*)` pattern matched any path *starting with* the literal
    // string "sign-in"/"sign-up", so a hypothetical `/en/sign-in-history` audit page or
    // `/en/sign-up-bonus` marketing page would have silently become public. Fixed via the
    // slash-anchored `(/.*)?` pattern.
    expect(isPublicRoute(requestFor('/en/sign-in-history'))).toBe(false);
    expect(isPublicRoute(requestFor('/en/sign-up-bonus'))).toBe(false);
    expect(isPublicRoute(requestFor('/fa/sign-in-recovery-page'))).toBe(false);
  });
});
