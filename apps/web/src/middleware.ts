import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

/**
 * Protected-by-default posture -- ADR-029 (docs/architecture/029-clerk-identity-mapping-and-
 * provisioning.md). Only the marketing home page and Clerk's own sign-in/sign-up routes are
 * public; every other route (including anything added later) requires a session unless
 * explicitly added here. Matchers are locale-prefix-aware (ADR-033: `/`, `/:locale`,
 * `/:locale/sign-in(/.*)?`, `/:locale/sign-up(/.*)?`) since `next-intl`'s locale rewrite hasn't
 * run yet at the point this matcher is evaluated -- the raw incoming pathname still carries its
 * locale segment (or none, for the bare `/` case `next-intl` redirects from).
 *
 * The `(/.*)?` (slash-anchored optional suffix), not `(.*)`, is deliberate -- an independent
 * security review (2026-07-14) found `(.*)` matches any path that merely *starts with* the
 * literal string `sign-in`/`sign-up`, e.g. a hypothetical future `/en/sign-in-history` or
 * `/en/sign-up-bonus` route would silently become public. No current route triggers this, but
 * the failure mode is silent (no test catches it without deliberately naming a colliding
 * route), so it's fixed here before any such route gets added.
 */
export const isPublicRoute = createRouteMatcher([
  '/',
  '/:locale',
  '/:locale/sign-in(/.*)?',
  '/:locale/sign-up(/.*)?',
]);

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Without an explicit `unauthenticatedUrl`, `auth.protect()` falls back to Clerk's generic
 * hosted Account Portal (`*.accounts.dev`) rather than this app's own locale-aware `/sign-in`
 * page -- confirmed via real browser navigation during this session's Playwright pass. Since no
 * `NEXT_PUBLIC_CLERK_SIGN_IN_URL` env var can itself be locale-aware, the redirect target is
 * computed per-request from the incoming path's locale segment instead.
 */
function localeFromPath(pathname: string): string {
  const firstSegment = pathname.split('/')[1];
  return (routing.locales as readonly string[]).includes(firstSegment)
    ? firstSegment
    : routing.defaultLocale;
}

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    const locale = localeFromPath(req.nextUrl.pathname);
    await auth.protect({ unauthenticatedUrl: new URL(`/${locale}/sign-in`, req.url).toString() });
  }
  return intlMiddleware(req);
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/(api|trpc)(.*)'],
};
