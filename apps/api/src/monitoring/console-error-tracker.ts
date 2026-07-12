import type { ErrorTracker } from './error-tracker.interface';
import { logger } from '../config/logger';

/**
 * Default ErrorTracker -- no external vendor, logs via the existing structured Pino logger.
 * Active whenever SENTRY_DSN is unset (see error-tracker.ts), which is the correct default
 * for this environment: no live Sentry account exists (see docs/operations/025-m1.6-
 * operational-activation-report.md). This is not a placeholder to be deleted later -- it is a
 * legitimate, permanent fallback for any environment (e.g. a developer's machine) that
 * shouldn't report to a shared error-tracking project.
 */
export class ConsoleErrorTracker implements ErrorTracker {
  captureException(error: unknown, context?: Record<string, string>): void {
    logger.error(
      { err: error, ...context },
      'error_tracked (console fallback -- SENTRY_DSN not set)',
    );
  }
}
