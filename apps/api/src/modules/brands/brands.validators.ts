import { z } from 'zod';

/**
 * Raw brand-intake answers only -- per docs/product/mvp-social-ai/023-acceptance-criteria.md
 * "Guided Brand Intake": vertical, tone, audience, visual style at minimum. `vertical` itself
 * is not re-submitted here -- it's derived from the account (set at account creation), so the
 * two can't drift apart.
 */
export const brandIntakeSchema = z.object({
  rawToneAnswer: z.string().min(1).max(2000),
  rawAudienceAnswer: z.string().min(1).max(2000),
  rawVisualAnswer: z.string().min(1).max(2000),
  rawOfferingsAnswer: z.string().min(1).max(2000),
});

export type BrandIntakeBody = z.infer<typeof brandIntakeSchema>;
