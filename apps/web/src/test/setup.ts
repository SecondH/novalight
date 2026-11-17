import { vi } from 'vitest';
import en from '../../messages/en.json';
import fa from '../../messages/fa.json';

type Messages = Record<string, unknown>;
const MESSAGES: Record<string, Messages> = { en, fa };

function getNode(messages: Messages, path: string): unknown {
  return path.split('.').reduce<unknown>((node, part) => {
    if (node && typeof node === 'object') return (node as Messages)[part];
    return undefined;
  }, messages);
}

function makeT(locale: string, namespace?: string) {
  const t = (key: string, values?: Record<string, string | number>) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    const node = getNode(MESSAGES[locale], fullKey);
    if (typeof node !== 'string') return fullKey;
    if (!values) return node;
    return node.replace(/\{(\w+)\}/g, (_match, name: string) => String(values[name] ?? ''));
  };
  t.raw = (key: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return getNode(MESSAGES[locale], fullKey);
  };
  return t;
}

/**
 * `next-intl/server`'s real implementation relies on Next.js's request-scoped AsyncLocalStorage,
 * which doesn't exist outside an actual Next.js server request -- so Server Component tests
 * (async page/layout components calling `getTranslations`/`setRequestLocale`) need this mock to
 * run under plain Vitest. It reads the *real* message files (per-test locale, default 'en'), not
 * fabricated stubs, per ADR-033 "Testing". Client Components using `useTranslations` don't need
 * this -- they go through `renderWithIntl` (`src/test/i18n-test-utils.tsx`) instead, which
 * provides the real `NextIntlClientProvider` React context.
 */
vi.mock('next-intl/server', () => ({
  getTranslations: async (options?: string | { namespace?: string; locale?: string }) => {
    if (typeof options === 'string') return makeT('en', options);
    return makeT(options?.locale ?? 'en', options?.namespace);
  },
  setRequestLocale: () => {},
  getLocale: async () => 'en',
}));
