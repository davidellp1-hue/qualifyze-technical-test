# UI Automation — SauceDemo (Playwright + TypeScript)

System Under Test (SUT): https://www.saucedemo.com/ (demo e-commerce).
Goal: automate high-value UI scenarios that already exist as manual test cases (`TC-<FEATURE>-NNN`, written in Gherkin). **Full UI**: no API layer, no API clients, no network mocking.

Work incrementally, one change at a time. Do not start the next step until the user asks for it.

## Language
**Everything in English**: code, comments, test titles, step texts, README, skills and the reports given back to the user.

## Skills
| Skill | Use it to |
|---|---|
| `pw-project-setup` | Create or change the project scaffolding, config, scripts, lint, reporters, README |
| `pw-page-object` | Create or change page objects / components and their locators |
| `pw-test-spec` | Turn a manual test case (Gherkin) into fixtures + data + spec |
| `pw-run-report` | Run tests, debug failures, triage them (test issue vs product bug) and report results |

To automate a new test case, start with `pw-test-spec`: it uses `pw-page-object` for the pages and `pw-run-report` to verify the result.

## Project structure
```
src/
  config/playwright.config.ts   # single config: chromium + firefox + webkit, BASE_URL env var with default
  common/
    fixtures.ts                 # one fixture per page object
    pages/                      # page objects shared by 2+ features
    helpers/                    # plain functions used by 2+ features (no page objects here)
    data/                       # users.ts (User enum + PASSWORD), products.ts
  features/<feature>/
    pages/                      # only if the feature has its own page objects
    helpers/                    # only if the feature has its own helpers
    tests/<feature>.spec.ts
```
**KISS:** add a file, method, locator, dependency, script or option only when a current test uses it. No base classes or wrappers in advance.

## Conventions
- **Features** (folder -> code used in test IDs): `login` -> `LOGIN`, `purchase` -> `CHK`.
- **Test title**: `[TC-<FEATURE>-NNN] <exact test case title>`; a Scenario Outline row appends ` - <example value>`.
- **No tags**: tests are selected by test case ID (`--grep TC-LOGIN-001`), folder or browser. Priority (High/Medium/Low, never P1/P2) lives in the manual test case and the README table.
- **Users**: password `secret_sauce` for all; `standard_user` is the functional oracle; `locked_out_user` is the blocked user.
- **Browsers**: every test runs on Chromium, Firefox and WebKit (desktop viewport). Docker (official Playwright image) runs all three on any host.
- **Reporters**: list, html, Allure 3.
- Quality bar: no `waitForTimeout`, no XPath, no `TODO`/`TBD`/placeholders, no commented-out code, no references to AI tools in code (the README's "AI-assisted development" section is the only place that describes the AI workflow).
