import type { Request, Response } from 'express';
import { HealthService } from '../services/health.service';

const healthService = new HealthService();

/** Controllers only translate HTTP <-> Service calls -- no business logic, no direct data access. */
export function getHealth(_req: Request, res: Response): void {
  const status = healthService.getStatus();
  res.status(200).json({ success: true, data: status });
}
