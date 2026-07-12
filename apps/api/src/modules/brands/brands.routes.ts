import { Router } from 'express';
import { submitBrandIntake, getMyBrand } from './brands.controller';
import { requireAuthentication } from '../../middlewares/authentication';
import { validateBody } from '../../middlewares/validate-body';
import { agentInvocationRateLimit } from '../../middlewares/rate-limit';
import { brandIntakeSchema } from './brands.validators';

export const brandsRouter = Router();

brandsRouter.post(
  '/brands/intake',
  requireAuthentication,
  agentInvocationRateLimit,
  validateBody(brandIntakeSchema),
  submitBrandIntake,
);
brandsRouter.get('/brands/me', requireAuthentication, getMyBrand);
