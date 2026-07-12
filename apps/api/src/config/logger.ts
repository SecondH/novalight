import pino from 'pino';
import { env } from './env';

/**
 * Structured, production-safe logging per docs/architecture/010-backend-architecture.md
 * "Logging Strategy": never log passwords, tokens, secrets, or private user data.
 * pino-http (wired in middlewares/logging.ts) attaches a per-request child logger.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  transport:
    env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  redact: ['req.headers.authorization', 'req.headers.cookie'],
});
