import { z } from 'zod';
import { env } from '../../config/env';

/**
 * No provider/model field exists on this schema at all -- per requirement, the client cannot
 * select either; both come only from server configuration (env.ts -> the provider factory).
 * Any provider/model the client sends in the request body is silently stripped by Zod's default
 * unknown-key behavior, never reaching the service.
 */
export const generateTextSchema = z.object({
  systemPrompt: z.string().trim().min(1).max(4000).optional(),
  userPrompt: z
    .string()
    .trim()
    .min(1, 'userPrompt must not be empty')
    .max(
      env.AI_MAX_PROMPT_CHARS,
      `userPrompt must not exceed ${env.AI_MAX_PROMPT_CHARS} characters`,
    ),
  temperature: z.number().min(0).max(2).optional(),
  maxOutputTokens: z
    .number()
    .int()
    .positive()
    .max(env.AI_MAX_OUTPUT_TOKENS, `maxOutputTokens must not exceed ${env.AI_MAX_OUTPUT_TOKENS}`)
    .optional(),
});

export type GenerateTextBody = z.infer<typeof generateTextSchema>;
