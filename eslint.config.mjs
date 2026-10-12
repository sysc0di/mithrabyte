import js from "@eslint/js";
import globals from "globals";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      "build/**",
      ".next/**",
      "node_modules/**",
      "src/generated/**",
      "prisma/migrations/**",
      "src/effects/**",
      "public/**",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        // Server and browser builds coexist in this app router project, so
        // both global namespaces are exposed to keep `no-undef` useful for
        // actual typos without churn from environment differences.
        ...globals.node,
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-constant-condition": ["warn", { checkLoops: false }],
    },
  },
  {
    files: ["**/*.test.js", "**/__tests__/**"],
    languageOptions: {
      globals: globals.node,
    },
  },
];