/**
 * Manually triggered end-to-end smoke test of the Brand/Content agent pipeline against the real
 * Groq API -- NOT picked up by jest (no ".test.ts" suffix) and never run in CI. Invoke
 * explicitly: `npm run smoke:agents --workspace=@novalight/api`.
 *
 * Runs all four agents once on a fixed, fictional Persian cafe brief (4 Groq calls) and prints
 * the parsed output, so prompt quality can be judged by eye. No database, no auth. Never prints
 * GROQ_API_KEY. Skips safely (exit 0) unless AI_ENABLED=true, AI_PROVIDER=groq and the Groq
 * key/model are set in apps/api/.env.
 */
import { AiProviderError } from '@novalight/ai-core';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { createAgentModelProvider } from './agent-model-provider-factory';
import { SimpleAgentExecutor } from './simple-agent-executor';
import { StaticPromptManager } from './static-prompt-manager';
import { BrandStrategistAgent } from './agents/brand-strategist.agent';
import { ContentPlannerAgent } from './agents/content-planner.agent';
import { CopywriterAgent } from './agents/copywriter.agent';
import { VisualPromptEngineerAgent } from './agents/visual-prompt-engineer.agent';

async function main(): Promise<void> {
  if (
    env.AI_ENABLED !== 'true' ||
    env.AI_PROVIDER !== 'groq' ||
    !env.GROQ_API_KEY ||
    !env.GROQ_MODEL
  ) {
    console.log(
      '[smoke:agents] Skipped -- requires AI_ENABLED=true, AI_PROVIDER=groq, GROQ_API_KEY and GROQ_MODEL in apps/api/.env.',
    );
    process.exit(0);
  }

  const modelProvider = createAgentModelProvider({
    aiEnabled: true,
    allowFakeProvider: false,
    provider: env.AI_PROVIDER,
    groqApiKey: env.GROQ_API_KEY,
    groqModel: env.GROQ_MODEL,
    timeoutMs: env.AI_REQUEST_TIMEOUT_MS,
    retryCount: env.AI_RETRY_COUNT,
    maxOutputTokens: env.AI_MAX_OUTPUT_TOKENS,
    // Prints model, finish reason, latency and token counts per call -- never content.
    logger,
  });
  const prompts = new StaticPromptManager();
  const executor = new SimpleAgentExecutor(modelProvider);

  console.log(`[smoke:agents] provider=${modelProvider.providerId} model=${env.GROQ_MODEL}\n`);

  try {
    const brand = await new BrandStrategistAgent(prompts, executor).interpretIntake({
      vertical: 'CAFE',
      rawToneAnswer: 'صمیمی، گرم و کمی شوخ',
      rawAudienceAnswer: 'دانشجوها و کارمندهای اطراف دانشگاه تهران',
      rawVisualAnswer: 'رنگ‌های قهوه‌ای و کرم، نور طبیعی، حس دنج',
      rawOfferingsAnswer: 'قهوه تخصصی، کیک خانگی، صبحانه',
    });
    console.log('1) Brand profile:', JSON.stringify(brand, null, 2), '\n');

    const ideas = await new ContentPlannerAgent(prompts, executor).generateIdeas({
      vertical: 'CAFE',
      toneDescriptors: brand.toneDescriptors,
      audienceDescription: brand.audienceDescription,
    });
    console.log('2) Content ideas:', JSON.stringify(ideas, null, 2), '\n');

    const topic = ideas[0]?.topic ?? 'معرفی کیک خانگی امروز';
    const [caption, visualPrompt] = await Promise.all([
      new CopywriterAgent(prompts, executor).draftCaption({
        topic,
        toneDescriptors: brand.toneDescriptors,
      }),
      new VisualPromptEngineerAgent(prompts, executor).draftVisualPrompt({
        topic,
        visualStyleDescriptors: brand.visualStyleDescriptors,
      }),
    ]);
    console.log('3) Caption:\n' + caption + '\n');
    console.log('4) Visual prompt:\n' + visualPrompt + '\n');
    console.log('[smoke:agents] SUCCESS');
    process.exit(0);
  } catch (error) {
    console.error('[smoke:agents] FAILURE');
    if (error instanceof AiProviderError) {
      console.error(`  code:    ${error.code}`);
      console.error(`  message: ${error.message}`);
    } else {
      console.error('  An unexpected error occurred (not a recognized AiProviderError).');
    }
    process.exit(1);
  }
}

void main();
