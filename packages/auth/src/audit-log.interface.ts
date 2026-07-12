/**
 * Audit trail shape per docs/security/013-security-architecture.md §16 ("Audit records
 * should contain: Actor, Action, Resource, Timestamp, Result"). Interface only -- no storage
 * backend is wired yet; Phase 0 has no sensitive operation that requires auditing.
 */
export interface AuditEvent {
  actor: string;
  action: string;
  resource: string;
  timestamp: string;
  result: 'success' | 'failure';
}

export interface AuditLogger {
  record(event: AuditEvent): Promise<void>;
}
