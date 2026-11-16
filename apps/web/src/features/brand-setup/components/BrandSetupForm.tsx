'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { Vertical } from '@/lib/verticals';
import { FieldStep } from './FieldStep';
import { ReviewStep } from './ReviewStep';
import type { BrandSetupField } from '../suggestions';

/**
 * Guided brand-intake flow -- per docs/product/mvp-social-ai/020-user-journeys.md §1,
 * docs/architecture/social-ai-platform/028-m1-technical-design.md §4.5, and ADR-034 (module
 * scope). Redesigned as a 4-step-plus-review wizard with per-vertical suggestion chips, per the
 * accepted "suggestion chips augment free text" decision (2026-07-14) -- the four fields
 * (`toneDescriptors`/`audienceDescription`/`visualStyleDescriptors`/`offeringsSummary`) remain
 * exactly what the backend already expects: free-text narrative answers, unchanged contract.
 *
 * Fetches a fresh Clerk session token via useAuth().getToken() at submit time, not once at
 * page-render time -- Clerk session tokens expire in ~60 seconds by design. See ADR-029.
 */

const FIELD_ORDER: BrandSetupField[] = ['tone', 'audience', 'visual', 'offerings'];
const STORAGE_KEY = 'novalight.brandSetup.v1';
const TOTAL_STEPS = FIELD_ORDER.length + 1; // 4 fields + 1 review step

interface BrandProfile {
  id: string;
  toneDescriptors: string;
  audienceDescription: string;
  visualStyleDescriptors: string;
  offeringsSummary: string;
}

type Answers = Record<BrandSetupField, string>;

interface StoredState {
  step: number;
  answers: Answers;
}

const EMPTY_ANSWERS: Answers = { tone: '', audience: '', visual: '', offerings: '' };

export function BrandSetupForm() {
  const { getToken } = useAuth();
  const t = useTranslations('onboarding.brandSetup');
  const tOnboarding = useTranslations('onboarding');
  const tCommon = useTranslations('common');
  const ta11y = useTranslations('a11y');

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [vertical, setVertical] = useState<Vertical | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Restores in-progress answers on mount -- covers both an accidental reload and a locale
  // switch (which navigates to a new URL and remounts this Client Component). See ADR-033
  // "no data loss when changing language".
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: StoredState = JSON.parse(raw);
        setStep(parsed.step ?? 0);
        setAnswers((prev) => ({ ...prev, ...parsed.answers }));
      }
    } catch {
      // Corrupt/unavailable sessionStorage isn't fatal -- just start fresh.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ step, answers } satisfies StoredState));
    } catch {
      // Best-effort persistence only.
    }
  }, [step, answers, hydrated]);

  // Vertical drives which suggestion chips are most relevant -- fetched from the real
  // GET /accounts/me endpoint (ADR-034), not fabricated. A failed/slow fetch degrades
  // gracefully to generic-only suggestions rather than blocking the form.
  useEffect(() => {
    let cancelled = false;
    async function loadAccount() {
      const token = await getToken();
      if (!token || cancelled) return;
      const result = await apiRequest<{ vertical: Vertical }>('/accounts/me', { token });
      if (!cancelled && result.success) {
        setVertical(result.data.vertical);
      }
    }
    void loadAccount();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  async function handleFinalSubmit() {
    setStatus('submitting');
    setErrorMessage('');

    const token = await getToken();
    if (!token) {
      setStatus('error');
      setErrorMessage(tCommon('sessionExpired'));
      return;
    }

    const result = await apiRequest<BrandProfile>('/brands/intake', {
      method: 'POST',
      token,
      body: {
        rawToneAnswer: answers.tone,
        rawAudienceAnswer: answers.audience,
        rawVisualAnswer: answers.visual,
        rawOfferingsAnswer: answers.offerings,
      },
    });

    if (!result.success) {
      setStatus('error');
      setErrorMessage(result.error.message);
      return;
    }

    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Best-effort cleanup only.
    }
    setStatus('idle');
    setProfile(result.data);
  }

  if (profile) {
    return (
      <section aria-label={ta11y('brandProfileReview')} className="flex flex-col gap-5">
        <h2 className="font-heading text-lg font-semibold text-foreground">{t('reviewTitle')}</h2>
        <dl className="flex flex-col gap-4">
          <div>
            <dt className="text-xs font-medium text-muted-foreground">{t('summaryLabels.tone')}</dt>
            <dd className="mt-1 text-sm text-foreground">{profile.toneDescriptors}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">
              {t('summaryLabels.audience')}
            </dt>
            <dd className="mt-1 text-sm text-foreground">{profile.audienceDescription}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">
              {t('summaryLabels.visual')}
            </dt>
            <dd className="mt-1 text-sm text-foreground">{profile.visualStyleDescriptors}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">
              {t('summaryLabels.offerings')}
            </dt>
            <dd className="mt-1 text-sm text-foreground">{profile.offeringsSummary}</dd>
          </div>
        </dl>
      </section>
    );
  }

  const isReviewStep = step === FIELD_ORDER.length;
  const progressValue = ((step + 1) / TOTAL_STEPS) * 100;
  const currentField = FIELD_ORDER[step];

  return (
    <div aria-label={ta11y('brandIntakeForm')} className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Progress value={progressValue} />
        <p className="text-sm text-muted-foreground">
          {tOnboarding('progress', { current: step + 1, total: TOTAL_STEPS })}
        </p>
      </div>

      {!isReviewStep ? (
        <FieldStep
          field={currentField}
          value={answers[currentField]}
          vertical={vertical}
          onChange={(next) => setAnswers((prev) => ({ ...prev, [currentField]: next }))}
        />
      ) : (
        <ReviewStep answers={answers} onEdit={setStep} />
      )}

      {status === 'error' ? (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex items-center justify-between border-t border-border/70 pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setStep((current) => Math.max(0, current - 1))}
          disabled={step === 0}
        >
          <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
          {tCommon('back')}
        </Button>

        {isReviewStep ? (
          <Button type="button" onClick={handleFinalSubmit} disabled={status === 'submitting'}>
            {status === 'submitting' ? t('submitting') : t('confirm')}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => setStep((current) => Math.min(FIELD_ORDER.length, current + 1))}
            disabled={!answers[currentField].trim()}
          >
            {tCommon('continue')}
            <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
