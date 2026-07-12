import type { AuditEvent, AuditLogger } from '@novalight/auth';
import { logger } from '../config/logger';

/**
 * Concrete AuditLogger implementation for M1. No dedicated audit-storage backend has been
 * decided (packages/auth's AuditLogger interface comment: "no storage backend is wired yet").
 * This logs audit events through the existing structured Pino logger rather than inventing a
 * new storage decision -- a distinct log level/marker (`audit: true`) makes these events
 * filterable, but replacing this with a real audit store later requires no interface change.
 * Per docs/architecture/social-ai-platform/028-m1-technical-design.md §2.4: called for
 * account-creation, brand-profile changes, and content-draft approval/discard only.
 */
export class PinoAuditLogger implements AuditLogger {
  async record(event: AuditEvent): Promise<void> {
    logger.info({ audit: true, ...event }, 'audit_event');
  }
}

export const auditLogger = new PinoAuditLogger();
