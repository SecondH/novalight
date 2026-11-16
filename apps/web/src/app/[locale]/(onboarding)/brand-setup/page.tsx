import { getTranslations } from 'next-intl/server';
import { BrandSetupForm } from '@/features/brand-setup/components/BrandSetupForm';
import { Container } from '@/components/shared/container';

/**
 * Brand-setup route -- docs/product/mvp-social-ai/020-user-journeys.md §1. Route group
 * "(onboarding)" per docs/architecture/011-frontend-architecture.md §6, does not affect the
 * URL (resolves to /[locale]/brand-setup).
 *
 * No server-side token fetch here -- src/middleware.ts already redirects unauthenticated
 * requests to /sign-in before this Server Component renders, per its protected-by-default
 * posture, and BrandSetupForm fetches its own fresh session token client-side at submit time
 * (Clerk session tokens expire in ~60 seconds; a token fetched once here would routinely be
 * stale by the time a user finishes the form). See ADR-029.
 */
export default async function BrandSetupPage() {
  const t = await getTranslations('onboarding.brandSetup');

  return (
    <main id="main-content" className="flex-1 py-12 sm:py-16">
      <Container className="max-w-2xl">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            {t('title')}
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">{t('description')}</p>
        </div>
        <BrandSetupForm />
      </Container>
    </main>
  );
}
