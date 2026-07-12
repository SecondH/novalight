'use client';

import { useState } from 'react';
import { apiRequest } from '@/lib/api-client';

/**
 * Guided brand-intake form -- per docs/product/mvp-social-ai/020-user-journeys.md §1 and
 * docs/architecture/social-ai-platform/028-m1-technical-design.md §4.5 "Onboarding Flow".
 * Onboarding skeleton scope: no React Hook Form/Zod/TanStack Query yet (see api-client.ts
 * comment) -- plain controlled inputs and fetch, matching "skeleton" scope, not the full
 * feature. Assumes an Account already exists and a session token is available (Stage 1's
 * account-creation step precedes this form; not built here as it depends on the real
 * Clerk-backed AuthProvider this M1 skeleton does not include, per
 * docs/architecture/social-ai-platform/028-m1-technical-design.md §2.1).
 */

const VERTICALS = [
  { value: 'BEAUTY_SALON', label: 'Beauty Salon' },
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'CAFE', label: 'Cafe' },
  { value: 'LOCAL_SERVICE', label: 'Local Service Business' },
  { value: 'RETAIL', label: 'Retail' },
] as const;

interface BrandProfile {
  id: string;
  toneDescriptors: string;
  audienceDescription: string;
  visualStyleDescriptors: string;
  offeringsSummary: string;
}

export interface BrandSetupFormProps {
  /** Session token for the authenticated account -- see component doc comment above. */
  token: string;
}

export function BrandSetupForm({ token }: BrandSetupFormProps) {
  const [rawToneAnswer, setRawToneAnswer] = useState('');
  const [rawAudienceAnswer, setRawAudienceAnswer] = useState('');
  const [rawVisualAnswer, setRawVisualAnswer] = useState('');
  const [rawOfferingsAnswer, setRawOfferingsAnswer] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [profile, setProfile] = useState<BrandProfile | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    const result = await apiRequest<BrandProfile>('/brands/intake', {
      method: 'POST',
      token,
      body: { rawToneAnswer, rawAudienceAnswer, rawVisualAnswer, rawOfferingsAnswer },
    });

    if (!result.success) {
      setStatus('error');
      setErrorMessage(result.error.message);
      return;
    }

    setStatus('idle');
    setProfile(result.data);
  }

  if (profile) {
    return (
      <section aria-label="Brand profile review">
        <h2>Review your brand profile</h2>
        <dl>
          <dt>Tone</dt>
          <dd>{profile.toneDescriptors}</dd>
          <dt>Audience</dt>
          <dd>{profile.audienceDescription}</dd>
          <dt>Visual style</dt>
          <dd>{profile.visualStyleDescriptors}</dd>
          <dt>Offerings</dt>
          <dd>{profile.offeringsSummary}</dd>
        </dl>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Brand intake">
      <label htmlFor="tone">In a few words, how would you describe your brand&apos;s tone?</label>
      <textarea
        id="tone"
        value={rawToneAnswer}
        onChange={(e) => setRawToneAnswer(e.target.value)}
        required
      />

      <label htmlFor="audience">Who is your typical customer?</label>
      <textarea
        id="audience"
        value={rawAudienceAnswer}
        onChange={(e) => setRawAudienceAnswer(e.target.value)}
        required
      />

      <label htmlFor="visual">How would you describe your visual style?</label>
      <textarea
        id="visual"
        value={rawVisualAnswer}
        onChange={(e) => setRawVisualAnswer(e.target.value)}
        required
      />

      <label htmlFor="offerings">What do you offer?</label>
      <textarea
        id="offerings"
        value={rawOfferingsAnswer}
        onChange={(e) => setRawOfferingsAnswer(e.target.value)}
        required
      />

      <button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Generating your brand profile…' : 'Continue'}
      </button>

      {status === 'error' && <p role="alert">{errorMessage}</p>}
    </form>
  );
}

export { VERTICALS };
