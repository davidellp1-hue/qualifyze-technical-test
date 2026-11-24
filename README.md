# SauceDemo — UI Automation

## Objective
Automate high-value UI scenarios of [SauceDemo](https://www.saucedemo.com/) as fast, repeatable end-to-end checks on Chromium, Firefox and WebKit. Each automated test traces to a manual test case (`TC-<FEATURE>-NNN`).

## Tech stack
- **Language:** TypeScript on Node.js
- **Framework / runner:** Playwright Test
- **Browsers:** Chromium, Firefox, WebKit (desktop)
- **Reports:** Playwright HTML, Allure 3
- **Code quality:** ESLint (typescript-eslint, eslint-plugin-playwright) + Prettier

Tested with Node.js 26.13, Playwright 1.65.1 (Docker image `mcr.microsoft.com/playwright:v1.65.1-noble`), TypeScript 6.0.3, ESLint 10.15 and Allure 3.33. `package.json` pins these exact versions, so `npm install` installs the same direct dependencies.

## Project structure
```
src/
  config/playwright.config.ts   # browsers, base URL, reporters
  common/
    fixtures.ts                 # page objects exposed as Playwright fixtures
    pages/                      # page objects shared by several features
    helpers/                    # small functions used by several features
    data/                       # test users, password and products
  features/<feature>/           # one folder per feature: login, purchase
    pages/                      # page objects used only by that feature
    helpers/                    # functions used only by that feature
    tests/                      # specs
```

## Prerequisites
Install these once on your machine:

| Tool | Version | Why | Check |
|---|---|---|---|
| [Node.js](https://nodejs.org/) (includes npm) | 22.18 or later | Runs Playwright, TypeScript and the Allure 3 report | `node -v`, `npm -v` |
| [Git](https://git-scm.com/) | any | Clone the repository | `git --version` |
| [Docker](https://docs.docker.com/get-docker/) or Podman (optional) | any | Run the tests in the official Playwright image, with all browser dependencies included | `docker --version` |

Nothing else is needed: Playwright downloads its own browsers, and Allure 3 runs on Node (no Java).
Linux only: if a browser fails to start because of missing system libraries (most often WebKit), run `sudo npx playwright install-deps chromium firefox webkit` once (Debian/Ubuntu), or use Docker.

## Setup
```bash
git clone https://github.com/davidellp1-hue/qualifyze-technical-test.git
cd qualifyze-technical-test
npm install                # install the dependencies listed in package.json
npm run install:browsers   # download Chromium, Firefox and WebKit (re-run after upgrading Playwright)
```

With Docker instead (no local browsers needed):
```bash
npm run docker:build       # build the image (re-run after changing the code)
npm run docker:test        # run all tests in the container, then copy the reports to the project root
```

## Configuration
The only setting is the site under test: `BASE_URL` (default `https://www.saucedemo.com`), read from the environment, e.g. `BASE_URL=https://example.test npm test`.

## Usage
| Command | Description |
|---|---|
| `npm test` | Run all tests on the three browsers |
| `npm test -- --grep @login` | Run one feature (`@login`, `@purchase`) |
| `npm test -- --grep "TC-LOGIN-001"` | Run a single test case |
| `npm test -- --project=firefox` | Run on one browser |
| `npm run docker:test -- --project=webkit` | Same flags, inside Docker |
| `npm test -- --headed` / `npm test -- --ui` | Run with a visible browser / in Playwright UI mode |
| `npm run typecheck` / `npm run lint` | Type check / lint (`npm run lint:fix` to auto-fix) |
| `npm run clean:reports` | Delete all reports and test artifacts |

## Reports
Every run writes to the project root:

| Report | Location | Open with |
|---|---|---|
| Playwright HTML (steps, screenshots, traces of failures) | `playwright-report/` | `npm run report` |
| Allure 3 | `allure-results/` (raw) -> `allure-report/` | `npm run allure:report` (generates and serves it) |
| Failure artifacts (screenshot, trace) | `test-results/` | `npx playwright show-trace <path>/trace.zip` |

## Automated scenarios
| Test case | Title | Priority |
|---|---|---|
| TC-LOGIN-001 | Login with each accepted user (`standard_user`): redirect to `/inventory.html` and title "Products" | High |
| TC-LOGIN-002 | Locked-out user cannot log in (`locked_out_user`): stays on the login page with the "locked out" error and both fields highlighted; opening `/inventory.html` directly redirects to the login page | High |
| TC-CHK-001 | End-to-end purchase (`standard_user`): add 2 products, remove 1, checkout with "John", "Doe", "08001", check the overview and totals, finish, back home with an empty cart | High |

## Conventions
- **Page Objects** hold all locators, actions and assertions. Public methods are `given...` (precondition), `when...` (action) and `then...` (expected result); each one is a `test.step` whose text mirrors the test case's Gherkin line, so reports read like the scenario.
- **Locators:** `data-test` attributes via `getByTestId`, then roles and visible text. No XPath, no hard waits; only web-first assertions.
- **Specs** only chain page object calls; every test is independent (fresh browser context, so the cart starts empty).
- **Title:** `[TC-<FEATURE>-NNN] <test case title>`, so every test traces to its manual test case.
- **Tags:** one feature tag per spec (`@login`, `@purchase`), set on its `test.describe`.
- **Timeout and retries:** 40 s per test (Playwright's default is 30 s) and `retries: 1`, because the site under test is public and its response time varies. A test that only passes on the retry is reported as *flaky*, so it stays visible.

## AI-assisted development
This project was built with an AI coding assistant (Claude Code), driven and reviewed by the author:
- `CLAUDE.md` holds the project rules the assistant follows (structure, conventions, KISS, quality bar).
- `.claude/skills/` holds four task guides: project setup, page objects, test specs from Gherkin, and running/triaging tests.
- The author decided the scope, the structure and the conventions, reviewed every change, and checked the results: every locator and expected value was verified against the live site, and every test was made to fail on purpose to confirm it catches the problem it is meant to catch.
