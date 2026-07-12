export interface HealthStatus {
  status: 'ok';
  uptimeSeconds: number;
  timestamp: string;
}

/**
 * Trivial service demonstrating the Controller -> Service layering required by
 * docs/architecture/010-backend-architecture.md §8-10 -- even a health check goes through
 * the Service layer rather than being computed inline in the controller, so the pattern is
 * established before any real business logic exists.
 */
export class HealthService {
  getStatus(): HealthStatus {
    return {
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
