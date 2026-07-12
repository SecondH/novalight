import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

/**
 * server.ts starts the HTTP server and handles process lifecycle only -- per
 * docs/architecture/010-backend-architecture.md §6. Must NOT contain business logic or
 * database operations.
 */
const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`NovaLight API listening on port ${env.PORT} (${env.NODE_ENV})`);
});

function shutdown(signal: string): void {
  logger.info(`Received ${signal}, shutting down gracefully`);
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
