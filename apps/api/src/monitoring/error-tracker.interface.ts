/**
 * Error-tracking abstraction, same pattern as packages/auth's AuthProvider / packages/ai-core's
 * ModelProvider (ADR-007/009's Strategy Pattern applied to a new concern) -- per
 * docs/operations/025-m1.6-operational-activation-report.md's "error monitoring" decision.
 * Application code (error-handler.ts) depends on this interface, not a vendor SDK directly.
 */
export interface ErrorTracker {
  captureException(error: unknown, context?: Record<string, string>): void;
}
