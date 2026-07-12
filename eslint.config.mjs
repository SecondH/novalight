// Shared ESLint flat config for apps/api and packages/* (apps/web uses its own
// Next.js-generated eslint.config.mjs, which already includes next/core-web-vitals + TS rules).
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.next/**', '**/coverage/**', 'apps/web/**'],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
);
