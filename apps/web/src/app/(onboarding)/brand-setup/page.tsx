import { auth } from '@clerk/nextjs/server';
import { BrandSetupForm } from '@/features/brand-setup/components/BrandSetupForm';

/**
 * Brand-setup route -- docs/product/mvp-social-ai/020-user-journeys.md §1. Route group
 * "(onboarding)" per docs/architecture/011-frontend-architecture.md §6, does not affect the
 * URL (resolves to /brand-setup).
 *
 * Session comes from Clerk (Next.js 15 async `auth()`) -- see ADR-029
 * (docs/architecture/029-clerk-identity-mapping-and-provisioning.md). The `if (!token)` fallback
 * below is defensive only: src/middleware.ts already redirects unauthenticated requests to
 * /sign-in before this Server Component renders, per its protected-by-default posture.
 */
export default async function BrandSetupPage() {
  const session = await auth();
  const token = await session.getToken();

  if (!token) {
    return <p>Sign in to continue.</p>;
  }

  return (
    <main>
      <h1>Tell us about your business</h1>
      <BrandSetupForm token={token} />
    </main>
  );
}
