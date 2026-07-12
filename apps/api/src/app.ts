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
  app.use(express.json());

  app.use('/api/v1', v1Router);

  app.use(errorHandler);

  return app;
}
