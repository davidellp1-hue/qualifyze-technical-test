---
name: pw-project-setup
description: Scaffold and maintain the Playwright + TypeScript UI automation project for SauceDemo - folder structure, package.json scripts, tsconfig, playwright config (Chromium + Firefox, data-test ids, reporters), ESLint + Prettier, Allure 3, .gitignore and README. Use when the user asks to create/initialise the project, add or change a dependency, script, reporter, browser or config option, or update the README.
---

# Playwright Project Setup

Read `CLAUDE.md` first (structure, conventions). The project is **UI only** (no API clients or API calls) and follows **KISS**: every file, dependency, script and option must be used by a current test or workflow. Add things when they are needed, not in advance.

## Structure
```
.
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── .prettierrc / .prettierignore
├── .gitignore
├── README.md
├── CLAUDE.md                     # project rules for the AI assistant
├── .claude/skills/               # task guides (setup, page objects, specs, run/report)
└── src/
    ├── config/playwright.config.ts
    ├── common/
    │   ├── fixtures.ts           # one fixture per page object
    │   ├── pages/                # page objects used by 2+ features
    │   ├── helpers/              # plain functions used by 2+ features
    │   └── data/                 # users.ts (User enum + PASSWORD), products.ts
    └── features/<feature>/
        ├── pages/                # only if the feature has its own page objects
        ├── helpers/              # only if the feature has its own helpers
        └── tests/<feature>.spec.ts
```

## Core files

### `src/config/playwright.config.ts`
```ts
import { defineConfig, devices } from "@playwright/test";
import path from "path";

const projectRoot = path.resolve(__dirname, "../..");

export default defineConfig({
  testDir: path.join(projectRoot, "src/features"),
  outputDir: path.join(projectRoot, "test-results"),
  fullyParallel: true,
  timeout: 40_000,
  retries: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: path.join(projectRoot, "playwright-report"), open: "never" }],
    ["allure-playwright", { resultsDir: path.join(projectRoot, "allure-results") }],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? "https://www.saucedemo.com",
    testIdAttribute: "data-test",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],
});
```
- `testIdAttribute: "data-test"`: SauceDemo exposes `data-test`, so page objects use `getByTestId`.
- All paths (tests, outputs, reports) are absolute from `projectRoot`, so they never depend on where the command is run.
- Configuration is only `BASE_URL` (env var with default). No dotenv / `.env` files: there are no secrets and only one setting.
- `timeout: 40_000` (default 30 s) and `retries: 1`: the SUT is a public site with variable response time; a test that passes only on retry is reported as "flaky", so it stays visible. Never raise them to hide a real problem.
- Other timeouts are Playwright's defaults; change them only with a concrete reason and say why.

### `src/common/fixtures.ts`
```ts
import { test as base } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

type Fixtures = { loginPage: LoginPage };

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});
```
Fixtures only construct page objects; they never navigate or act. Add one entry per page object when a test needs it.

### `src/common/data/users.ts`
`export const PASSWORD = "secret_sauce";` and `export enum User { ... }` with only the users the tests use.

### `package.json` scripts
| Script | Command |
|---|---|
| `test` | `playwright test -c src/config/playwright.config.ts` |
| `typecheck` | `tsc --noEmit` |
| `lint` / `lint:fix` | `eslint .` / `eslint . --fix` |
| `report` | `playwright show-report playwright-report` |
| `allure:report` | `allure generate allure-results --clean -o allure-report --open` |
| `clean:reports` | `rm -rf test-results playwright-report allure-results allure-report` |
| `install:browsers` | `playwright install chromium firefox` (no `--with-deps`: it needs apt and fails on non-Debian hosts). Dependencies are installed separately with `npm install` (`package-lock.json` is not committed); no `postinstall` hook. |

Filters and modes are Playwright flags after `--` (`--grep TC-LOGIN-001`, `--project=firefox`, `--headed`, `--ui`); don't add a script per flag. `engines`: `node >= 22.18.0` (required by Allure 3).

### Dependencies (all dev)
`@playwright/test`, `typescript`, `@types/node` (major = minimum Node in `engines`), `allure-playwright`, `allure` (Allure 3: pure Node, no Java), `eslint`, `typescript-eslint`, `eslint-plugin-playwright`, `eslint-plugin-prettier`, `eslint-config-prettier`, `prettier`.
Install with `npm install -D --save-exact` (exact versions, no `^`: `package-lock.json` is not committed, so pinning keeps installs reproducible); never hand-write version numbers. Keep the "Tested with" line of the README in sync.

### `tsconfig.json`
`target ES2022`, `module commonjs`, `strict`, `esModuleInterop`, `skipLibCheck`, `noEmit`, `types: ["node"]` (TypeScript 6 no longer loads `@types/*` automatically); `include: ["src/**/*"]`.
TypeScript 6 initialises class fields before constructor parameter properties: declare locators as constructor parameter properties with a default from `page` (see `pw-page-object`), not as field initialisers using `this.page`.

### `eslint.config.mjs`
`tseslint.config(ignores, tseslint.configs.recommended, { files: ["src/**/*.ts"], extends: [playwright.configs["flat/recommended"]], rules }, prettierRecommended)`.
For `src/**/*.ts`: `languageOptions.parserOptions.projectService: true` (type information) and `"@typescript-eslint/no-floating-promises": "error"`, so a page object call without `await` fails lint (`missing-playwright-await` only covers Playwright's own calls). Assertions live in `then*` page methods, so: `"playwright/expect-expect": ["error", { assertFunctionPatterns: ["^then"] }]` (verified to match member calls like `cartPage.thenX()`).
`.prettierrc`: `{ "trailingComma": "all" }`. `.prettierignore`: `*.md` and report folders.

### `.gitignore`
`node_modules/`, `package-lock.json`, `test-results/`, `playwright-report/`, `allure-results/`, `allure-report/`.

### `README.md` (concise, English)
Objective · Tech stack (with the "Tested with" versions) · Project structure · Prerequisites · Setup · Configuration · Usage · Reports · Automated scenarios (Test case | Title | Priority) · Conventions · AI-assisted development. Only document scripts and files that exist.

## Verify before reporting done
1. `npm run typecheck`, `npm run lint` and `npx prettier --check .` pass.
2. `npm test` runs on both projects; `playwright-report/` and `allure-results/` appear at the root.
3. Nothing unused: no dead files, exports, dependencies, scripts or config options.

Report back in English: files created/changed, commands run and their result, anything needing the user's decision.
