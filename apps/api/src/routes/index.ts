import { Router } from 'express';
import { healthRouter } from './health.routes';
import { accountsRouter } from '../modules/accounts/accounts.routes';
import { brandsRouter } from '../modules/brands/brands.routes';
import { contentRouter } from '../modules/content/content.routes';

/** All routes are versioned under /api/v1 per ADR-010. */
export const v1Router = Router();

v1Router.use(healthRouter);
v1Router.use(accountsRouter);
v1Router.use(brandsRouter);
v1Router.use(contentRouter);
