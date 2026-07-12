import * as Sentry from '@sentry/node';
import type { ErrorTracker } from './error-tracker.interface';

/**
 * Sentry-backed ErrorTracker. Recommended vendor per
 * docs/operations/023-environment-strategy.md §5 and docs/deployment/021-m1.5-production-
 * foundation-plan.md §8's readiness checklist -- not yet a ratified ADR-level decision, same
 * posture as ADR-019's CI/CD platform (proposed default, needs human confirmation before this
 * is the assumed choice long-term). Only instantiated when SENTRY_DSN is present (see
 * error-tracker.ts); no live Sentry project exists in this environment to validate against
 * end-to-end (see docs/operations/025-m1.6-operational-activation-report.md).
 */
export class SentryErrorTracker implements ErrorTracker {
  constructor(dsn: string, environment: string) {
    Sentry.init({ dsn, environment, tracesSampleRate: 0 });
  }

  captureException(error: unknown, context?: Record<string, string>): void {
    Sentry.captureException(error, context ? { tags: context } : undefined);
  }
}
