import pinoHttp from 'pino-http';
import type { Application } from 'express';
import { logger } from '../config/logger';

/** Request-scoped structured logging middleware. */
export function applyLoggingMiddleware(app: Application): void {
  app.use(pinoHttp({ logger }));
}
