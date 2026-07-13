import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Protected-by-default posture -- ADR-029 (docs/architecture/029-clerk-identity-mapping-and-
 * provisioning.md). Only the marketing home page and Clerk's own sign-in/sign-up routes are
 * public; every other route (including anything added later) requires a session unless
 * explicitly added here.
 */
export const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/(api|trpc)(.*)'],
};
