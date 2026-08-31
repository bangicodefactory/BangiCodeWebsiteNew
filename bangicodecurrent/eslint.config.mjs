import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // eslint-config-next already registers the jsx-a11y plugin; we layer the full
  // recommended rule set on top without re-declaring the plugin.
  {
    rules: jsxA11y.flatConfigs.recommended.rules,
  },
  /*
   * Playwright fixtures are declared as `async ({ … }, use) => { … await use(x) }`.
   * The react-hooks plugin sees a bare call to `use` — which IS a React hook in
   * React 19 — and reports a rules-of-hooks violation. There is no React in the
   * test runner at all, so the rule is off for the e2e tree only.
   */
  {
    files: ["e2e/**/*.ts"],
    rules: { "react-hooks/rules-of-hooks": "off" },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
