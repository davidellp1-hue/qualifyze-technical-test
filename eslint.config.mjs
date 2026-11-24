import tseslint from "typescript-eslint";
import playwright from "eslint-plugin-playwright";
import prettierRecommended from "eslint-plugin-prettier/recommended";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "test-results/**",
      "playwright-report/**",
      "allure-results/**",
      "allure-report/**",
    ],
  },
  tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    extends: [playwright.configs["flat/recommended"]],
    languageOptions: {
      // Type information, needed by no-floating-promises
      parserOptions: { projectService: true },
    },
    rules: {
      // A page object call without await (e.g. cartPage.whenIClickCheckout()) is an error
      "@typescript-eslint/no-floating-promises": "error",
      // Assertions live in page object methods named then...
      "playwright/expect-expect": [
        "error",
        { assertFunctionPatterns: ["^then"] },
      ],
    },
  },
  prettierRecommended,
);
