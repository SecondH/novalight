import type { Request, Response } from 'express';
import { AccountsService } from './accounts.service';
import { asyncHandler } from '../../utils/async-handler';
import { ApiError } from '../../middlewares/error-handler';

const accountsService = new AccountsService();

/** Controllers only translate HTTP <-> Service calls -- no business logic, no direct data access. */
export const createAccount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw new ApiError('authentication', 401, 'Missing authenticated user');
  const account = await accountsService.createAccount(req.userId, req.body.vertical);
  res.status(201).json({ success: true, data: account });
});

export const getMyAccount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw new ApiError('authentication', 401, 'Missing authenticated user');
  const account = await accountsService.getMyAccount(req.userId);
  res.status(200).json({ success: true, data: account });
});
