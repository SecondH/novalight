import { getTranslations } from 'next-intl/server';
import { AccountSetupForm } from '@/features/account-setup/components/AccountSetupForm';
import { Container } from '@/components/shared/container';

/**
 * The account/vertical-creation step that ADR-034 found missing entirely -- `POST /accounts`
 * was real and tested but had no page. Precedes `/brand-setup` in the onboarding flow (per
 * docs/architecture/social-ai-platform/028-m1-technical-design.md §4.5: account creation ->
 * vertical selection -> brand intake -> dashboard).
 */
export default async function AccountSetupPage() {
  const t = await getTranslations('onboarding.accountSetup');

  return (
    <main id="main-content" className="flex-1 py-12 sm:py-16">
      <Container className="max-w-2xl">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            {t('title')}
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">{t('description')}</p>
        </div>
        <AccountSetupForm />
      </Container>
    </main>
  );
}
