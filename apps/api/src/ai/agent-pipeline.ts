import { env } from '../config/env';
import { logger } from '../config/logger';
import { createAgentModelProvider, DisabledModelProvider } from './agent-model-provider-factory';
import { SimpleAgentExecutor } from './simple-agent-executor';
import { StaticPromptManager } from './static-prompt-manager';

/**
 * The single, shared agent-pipeline composition root for BrandsService and ContentService.
 * Resolved once at module load (fail-fast, same posture as env.ts and
 * ai-text-generation.service.ts). Prompt manager and executor are stateless and safe to share.
 */
const modelProvider = createAgentModelProvider({
  aiEnabled: env.AI_ENABLED === 'true',
  allowFakeProvider: env.NODE_ENV !== 'production',
  provider: env.AI_PROVIDER,
  groqApiKey: env.GROQ_API_KEY,
  groqModel: env.GROQ_MODEL,
  timeoutMs: env.AI_REQUEST_TIMEOUT_MS,
  retryCount: env.AI_RETRY_COUNT,
  maxOutputTokens: env.AI_MAX_OUTPUT_TOKENS,
  logger,
});

if (modelProvider instanceof DisabledModelProvider) {
  logger.warn(
    { aiAgentProvider: modelProvider.providerId },
    'AI generation is disabled: brand and content generation will answer 503. Set AI_ENABLED=true and AI_PROVIDER=groq to enable it.',
  );
} else {
  logger.info({ aiAgentProvider: modelProvider.providerId }, 'agent_pipeline_provider_selected');
}

export const agentPromptManager = new StaticPromptManager();
export const agentExecutor = new SimpleAgentExecutor(modelProvider);
