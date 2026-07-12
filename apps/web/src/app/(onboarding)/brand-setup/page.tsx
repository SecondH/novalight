'use client';

import { useEffect, useState } from 'react';
import { BrandSetupForm } from '@/features/brand-setup/components/BrandSetupForm';

/**
 * Brand-setup route -- docs/product/mvp-social-ai/020-user-journeys.md §1. Route group
 * "(onboarding)" per docs/architecture/011-frontend-architecture.md §6, does not affect the
 * URL (resolves to /brand-setup).
 *
 * Reads a session token from localStorage as an explicit placeholder: this M1 skeleton has no
 * real Clerk-backed session (docs/architecture/social-ai-platform/028-m1-technical-design.md
 * §2.1 -- authentication vendor integration is out of M1 scope). This must be replaced by
 * real session retrieval once Clerk is wired in, not extended.
 */
export default function BrandSetupPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(window.localStorage.getItem('novalight_dev_session_token'));
  }, []);

  if (token === null) {
    return <p>Sign in to continue. (No real authentication is wired up in this M1 skeleton.)</p>;
  }

  return (
    <main>
      <h1>Tell us about your business</h1>
      <BrandSetupForm token={token} />
    </main>
  );
}
