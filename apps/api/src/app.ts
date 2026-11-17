import express, { type Application } from 'express';
import { applySecurityMiddleware } from './middlewares/security';
import { applyLoggingMiddleware } from './middlewares/logging';
import { errorHandler } from './middlewares/error-handler';
import { v1Router } from './routes';

/**
 * app.ts configures Express, registers middleware, registers routes, configures error
 * handling -- per docs/architecture/010-backend-architecture.md §6. Must NOT contain
 * business logic or start the HTTP server (that's server.ts).
 */
export function createApp(): Application {
  const app = express();

  applySecurityMiddleware(app);
  applyLoggingMiddleware(app);
  // Must run before the global express.json() below -- Clerk webhook signature verification
  // (apps/api/src/modules/webhooks) needs the exact raw bytes Clerk signed, not a re-serialized
  // JSON object. body-parser sets req._body after parsing, so express.json() below correctly
  // no-ops for this path instead of re-parsing it.
  app.use('/api/v1/webhooks/clerk', express.raw({ type: 'application/json' }));
  // Explicit limit, not body-parser's implicit 100kb default -- comfortably covers
  // AI_MAX_PROMPT_CHARS's default (12,000 chars) plus JSON overhead and every other existing
  // endpoint's payload, but is a stated policy rather than an undocumented library default (an
  // independent security-reviewer pass flagged relying on the implicit default as a Low-severity
  // hygiene gap: if AI_MAX_PROMPT_CHARS is ever raised well past this without revisiting the
  // limit together, requests would fail with a generic body-parser 413 instead of the intended,
  // friendlier Zod VALIDATION_ERROR).
  app.use(express.json({ limit: '256kb' }));

  app.use('/api/v1', v1Router);

  app.use(errorHandler);

  return app;
}
