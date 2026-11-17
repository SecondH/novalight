'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { Scissors, Utensils, Coffee, Wrench, ShoppingBag, Check } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { VERTICALS, type Vertical } from '@/lib/verticals';

const VERTICAL_ICONS: Record<Vertical, typeof Scissors> = {
  BEAUTY_SALON: Scissors,
  RESTAURANT: Utensils,
  CAFE: Coffee,
  LOCAL_SERVICE: Wrench,
  RETAIL: ShoppingBag,
};

interface Account {
  id: string;
  vertical: Vertical;
}

/**
 * Fills a genuine gap found during repository discovery (ADR-034): `POST /accounts` and
 * `GET /accounts/me` are real, tested endpoints with no frontend page at all -- BrandSetupForm's
 * own code comment states it "assumes an Account already exists," which nothing in the UI
 * actually created. This is that missing first onboarding step.
 */
export function AccountSetupForm() {
  const { getToken } = useAuth();
  const router = useRouter();
  const t = useTranslations('onboarding.accountSetup');
  const tCommon = useTranslations('common');

  const [selected, setSelected] = useState<Vertical | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;

    setStatus('submitting');
    setErrorMessage('');

    const token = await getToken();
    if (!token) {
      setStatus('error');
      setErrorMessage(tCommon('sessionExpired'));
      return;
    }

    const result = await apiRequest<Account>('/accounts', {
      method: 'POST',
      token,
      body: { vertical: selected },
    });

    if (!result.success) {
      setStatus('error');
      setErrorMessage(result.error.message);
      return;
    }

    router.push('/brand-setup');
  }

  return (
    <form onSubmit={handleSubmit} aria-label={t('title')} className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-3">
        <legend className="font-heading text-base font-semibold text-foreground">
          {t('verticalQuestion')}
        </legend>
        <p className="text-sm text-muted-foreground">{t('verticalHint')}</p>

        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {VERTICALS.map((vertical) => {
            const Icon = VERTICAL_ICONS[vertical];
            const isSelected = selected === vertical;
            return (
              <button
                key={vertical}
                type="button"
                onClick={() => setSelected(vertical)}
                aria-pressed={isSelected}
                className={cn(
                  'flex items-start gap-3 rounded-xl border p-4 text-start transition-colors',
                  isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                    : 'border-border/70 bg-card hover:border-primary/40',
                )}
              >
                <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <span className="flex flex-1 flex-col gap-1">
                  <span className="font-medium text-foreground">{t(`verticals.${vertical}`)}</span>
                  <span className="text-xs text-muted-foreground">
                    {t(`verticalDescriptions.${vertical}`)}
                  </span>
                </span>
                {isSelected ? (
                  <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>
      </fieldset>

      {status === 'error' ? (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      <Button type="submit" disabled={!selected || status === 'submitting'} className="self-start">
        {status === 'submitting' ? t('submitting') : t('submit')}
      </Button>
    </form>
  );
}
