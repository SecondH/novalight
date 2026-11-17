import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { ApiError } from '../../middlewares/error-handler';
import { AiTextGenerationService } from '../../services/ai-text-generation.service';
import type { GenerateTextBody } from './ai.validators';

const aiTextGenerationService = new AiTextGenerationService();

function requireUser(req: Request): string {
  if (!req.userId) throw new ApiError('authentication', 401, 'Missing authenticated user');
  return req.userId;
}

/** Controller only translates HTTP <-> service call -- no business logic, no direct AI calls. */
export const generateText = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUser(req);
  const body = req.body as GenerateTextBody;

  const result = await aiTextGenerationService.generateText(userId, {
    systemPrompt: body.systemPrompt,
    userPrompt: body.userPrompt,
    temperature: body.temperature,
    maxOutputTokens: body.maxOutputTokens,
    // pino-http assigns req.id per request -- reused as the correlation id rather than trusting
    // a client-supplied value, consistent with not letting the client control tracing internals.
    correlationId: req.id !== undefined ? String(req.id) : undefined,
  });

  res.status(200).json({ success: true, data: result });
});
