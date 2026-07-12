import { z } from 'zod';

/** Verticals per docs/product/mvp-social-ai/018-target-customer-definition.md. */
export const createAccountSchema = z.object({
  vertical: z.enum(['BEAUTY_SALON', 'RESTAURANT', 'CAFE', 'LOCAL_SERVICE', 'RETAIL']),
});

export type CreateAccountBody = z.infer<typeof createAccountSchema>;
