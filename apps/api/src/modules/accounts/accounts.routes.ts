import { Router } from 'express';
import { createAccount, getMyAccount } from './accounts.controller';
import { requireAuthentication } from '../../middlewares/authentication';
import { validateBody } from '../../middlewares/validate-body';
import { createAccountSchema } from './accounts.validators';

export const accountsRouter = Router();

accountsRouter.post(
  '/accounts',
  requireAuthentication,
  validateBody(createAccountSchema),
  createAccount,
);
accountsRouter.get('/accounts/me', requireAuthentication, getMyAccount);
