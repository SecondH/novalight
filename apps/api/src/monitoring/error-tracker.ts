import type { ErrorTracker } from './error-tracker.interface';
import { ConsoleErrorTracker } from './console-error-tracker';
import { SentryErrorTracker } from './sentry-error-tracker';
import { env } from '../config/env';

export const errorTracker: ErrorTracker = env.SENTRY_DSN
  ? new SentryErrorTracker(env.SENTRY_DSN, env.NODE_ENV)
  : new ConsoleErrorTracker();

export type { ErrorTracker } from './error-tracker.interface';
