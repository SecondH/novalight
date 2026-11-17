import type { z } from 'zod';
import { AiProviderError } from '@novalight/ai-core';

const MALFORMED_OUTPUT_MESSAGE = 'The AI provider returned output in an unexpected format.';

/**
 * Real models often wrap JSON in a ```json fence or add a sentence around it. Strips a fence if
 * present, otherwise takes the outermost {...} or [...] span. Returns the input unchanged when
 * neither is found (JSON.parse then fails and is reported as malformed output).
 */
function extractJsonCandidate(text: string): string {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  const starts = [text.indexOf('{'), text.indexOf('[')].filter((index) => index >= 0);
  if (starts.length === 0) {
    return text.trim();
  }
  const start = Math.min(...starts);
  const end = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
  return end > start ? text.slice(start, end + 1) : text.trim();
}

/**
 * Parses and validates structured model output. Model output is untrusted input: anything that
 * isn't valid JSON matching `schema` becomes AiProviderError('upstream_error'), which the
 * services map to a safe 502 -- never a raw SyntaxError/ZodError (and never the model's text)
 * reaching the client.
 */
export function parseJsonModelOutput<T>(
  text: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
): T {
  let raw: unknown;
  try {
    raw = JSON.parse(extractJsonCandidate(text));
  } catch {
    throw new AiProviderError('upstream_error', MALFORMED_OUTPUT_MESSAGE);
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new AiProviderError('upstream_error', MALFORMED_OUTPUT_MESSAGE);
  }
  return parsed.data;
}

/**
 * Normalizes free-text model output (a caption, a visual prompt): trims whitespace and one pair
 * of wrapping quotes, then enforces a non-empty, bounded length.
 */
export function parseTextModelOutput(text: string, maxLength: number): string {
  const trimmed = text
    .trim()
    .replace(/^["“«](.*)["”»]$/s, '$1')
    .trim();
  if (trimmed.length === 0 || trimmed.length > maxLength) {
    throw new AiProviderError('upstream_error', MALFORMED_OUTPUT_MESSAGE);
  }
  return trimmed;
}
