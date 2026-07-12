import type { Request, Response } from 'express';
import { BrandsService } from './brands.service';
import { asyncHandler } from '../../utils/async-handler';
import { ApiError } from '../../middlewares/error-handler';

const brandsService = new BrandsService();

export const submitBrandIntake = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw new ApiError('authentication', 401, 'Missing authenticated user');
  const brand = await brandsService.submitIntake(req.userId, req.body);
  res.status(201).json({ success: true, data: brand });
});

export const getMyBrand = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw new ApiError('authentication', 401, 'Missing authenticated user');
  const brand = await brandsService.getMyBrand(req.userId);
  res.status(200).json({ success: true, data: brand });
});
