import { z } from 'zod';
import { AiProviderError } from '@novalight/ai-core';
import { parseJsonModelOutput, parseTextModelOutput } from './parse-model-output';

const schema = z.object({ name: z.string().min(1) });

describe('parseJsonModelOutput', () => {
  it('parses bare JSON', () => {
    expect(parseJsonModelOutput('{"name":"Nova"}', schema)).toEqual({ name: 'Nova' });
  });

  it('parses JSON inside a ```json fence', () => {
    expect(parseJsonModelOutput('Here you go:\n```json\n{"name":"Nova"}\n```', schema)).toEqual({
      name: 'Nova',
    });
  });

  it('parses JSON surrounded by commentary', () => {
    expect(parseJsonModelOutput('Sure! {"name":"Nova"} Hope this helps.', schema)).toEqual({
      name: 'Nova',
    });
  });

  it('parses a top-level array', () => {
    expect(parseJsonModelOutput('[{"name":"a"}]', z.array(schema))).toEqual([{ name: 'a' }]);
  });

  it('throws a safe upstream_error for non-JSON output', () => {
    expect(() => parseJsonModelOutput('I cannot help with that.', schema)).toThrow(AiProviderError);
    try {
      parseJsonModelOutput('I cannot help with that.', schema);
    } catch (error) {
      expect((error as AiProviderError).code).toBe('upstream_error');
      expect((error as AiProviderError).message).not.toContain('cannot help');
    }
  });

  it('throws upstream_error when JSON does not match the schema', () => {
    expect(() => parseJsonModelOutput('{"other":1}', schema)).toThrow(AiProviderError);
  });
});

describe('parseTextModelOutput', () => {
  it('trims whitespace and one pair of wrapping quotes', () => {
    expect(parseTextModelOutput('  "Fresh croissants today ☕"  ', 100)).toBe(
      'Fresh croissants today ☕',
    );
    expect(parseTextModelOutput('«کروسان تازه»', 100)).toBe('کروسان تازه');
  });

  it('keeps inner quotes intact', () => {
    expect(parseTextModelOutput('Try our "signature" latte', 100)).toBe(
      'Try our "signature" latte',
    );
  });

  it('rejects empty and over-long output', () => {
    expect(() => parseTextModelOutput('   ', 100)).toThrow(AiProviderError);
    expect(() => parseTextModelOutput('x'.repeat(101), 100)).toThrow(AiProviderError);
  });
});
