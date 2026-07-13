/**
 * Manually triggered smoke test against the real Groq API -- NOT picked up by jest (jest's
 * testMatch only matches files ending in ".test.ts"; this file deliberately doesn't) and never
 * run automatically in CI. Invoke explicitly: `npm run smoke:groq --workspace=@novalight/api`.
 *
 * Sends exactly one minimal, low-token request. Never prints GROQ_API_KEY or any other secret.
 * Skips safely (exit 0) if GROQ_API_KEY/GROQ_MODEL aren't set locally, so it's safe to leave in
 * the repo without accidentally consuming quota or failing for someone without a Groq account.
 */
import { env } from '../config/env';
import { GroqAiProvider } from './providers/groq-ai-provider';
import { AiProviderError } from '@novalight/ai-core';

async function main(): Promise<void> {
  if (!env.GROQ_API_KEY || !env.GROQ_MODEL) {
    console.log(
      '[smoke:groq] Skipped -- GROQ_API_KEY and/or GROQ_MODEL are not set. ' +
        'Set both in apps/api/.env to run this smoke test.',
    );
    process.exit(0);
  }

  console.log(`[smoke:groq] Sending one minimal request to Groq (model: ${env.GROQ_MODEL})...`);

  const provider = new GroqAiProvider({
    apiKey: env.GROQ_API_KEY,
    model: env.GROQ_MODEL,
    timeoutMs: env.AI_REQUEST_TIMEOUT_MS,
    retryCount: env.AI_RETRY_COUNT,
  });

  try {
    const result = await provider.generateText({
      userPrompt: 'Reply with only the single word: OK',
      maxOutputTokens: 5,
    });

    const preview = result.text.slice(0, 40).replace(/\s+/g, ' ').trim();
    console.log('[smoke:groq] SUCCESS');
    console.log(`  model:     ${result.model}`);
    console.log(`  latencyMs: ${result.latencyMs}`);
    console.log(`  usage:     ${JSON.stringify(result.usage ?? {})}`);
    console.log(`  preview:   "${preview}${result.text.length > 40 ? '...' : ''}"`);
    process.exit(0);
  } catch (error) {
    console.error('[smoke:groq] FAILURE');
    if (error instanceof AiProviderError) {
      // .message is always one of GroqAiProvider's own fixed, safe strings -- never the raw
      // vendor error body, per the same normalization the real API endpoint relies on.
      console.error(`  code:    ${error.code}`);
      console.error(`  message: ${error.message}`);
      if (error.code === 'configuration_error') {
        console.error(
          '  Hint: verify GROQ_API_KEY is valid and GROQ_MODEL is currently available to your ' +
            'Groq project (check the Groq console for available model ids). Select a model ' +
            'confirmed available there, then retry -- do not guess a substitute.',
        );
      }
    } else {
      console.error('  An unexpected error occurred (not a recognized AiProviderError).');
    }
    process.exit(1);
  }
}

void main();
