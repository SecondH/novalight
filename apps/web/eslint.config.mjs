import { defineConfig, globalIgnores } from "eslint/config";
import { FlatCompat } from "@eslint/eslintrc";

// The installed eslint-config-next ships shareable configs in the legacy (.eslintrc) shape,
// not flat-config arrays -- FlatCompat is Next.js's own documented bridge for consuming them
// under ESLint 9 flat config. Fixes a pre-existing scaffold defect (this file previously
// imported "eslint-config-next/core-web-vitals" directly and spread it as if it were already
// a flat array, which neither resolved nor, once the module path was corrected, was iterable)
// -- discovered while validating CI readiness for M1, unrelated to M1's own code.
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const eslintConfig = defineConfig([
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
