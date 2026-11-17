'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { apiRequest } from '@/lib/api-client';
import { useRouter } from '@/i18n/navigation';

type GateState = 'checking' | 'ready' | 'redirecting';

/**
 * Client-side onboarding-completeness gate for the (dashboard) route group -- mirrors the
 * documented onboarding flow (account -> vertical -> brand intake -> dashboard,
 * docs/architecture/social-ai-platform/028-m1-technical-design.md §4.5) which today has no
 * enforcing code (ADR-034). Deliberately client-side, consistent with every other data fetch in
 * this codebase (BrandSetupForm/AccountSetupForm both fetch their own Clerk token client-side)
 * -- a server-to-server Clerk-token-forwarding call from a Server Component would be new,
 * unreviewed auth-boundary-crossing plumbing not used anywhere else in this repository, and
 * introducing it here without its own security review would be out of scope for this pass.
 * Trade-off, stated plainly: a signed-in but not-yet-onboarded visitor sees a brief loading
 * state before redirecting, rather than never seeing the dashboard shell at all.
 */
export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const router = useRouter();
  const t = useTranslations('common');
  const [state, setState] = useState<GateState>('checking');

  useEffect(() => {
    let cancelled = false;

    async function checkOnboardingState() {
      const token = await getToken();
      if (!token) return;

      const accountResult = await apiRequest<{ id: string }>('/accounts/me', { token });
      if (cancelled) return;
      if (!accountResult.success) {
        setState('redirecting');
        router.replace('/account-setup');
        return;
      }

      // GET /brands/me returns `{ success: true, data: null }` (not an error response) when the
      // account exists but brand intake hasn't been completed yet -- confirmed by reading
      // apps/api/src/modules/brands/brands.service.ts's getMyBrand, unlike GET /accounts/me
      // above, which throws a 404 business error when no Account exists at all.
      const brandResult = await apiRequest<{ id: string } | null>('/brands/me', { token });
      if (cancelled) return;
      if (!brandResult.success || brandResult.data === null) {
        setState('redirecting');
        router.replace('/brand-setup');
        return;
      }

      setState('ready');
    }

    void checkOnboardingState();
    return () => {
      cancelled = true;
    };
  }, [getToken, router]);

  if (state !== 'ready') {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  return <>{children}</>;
}
