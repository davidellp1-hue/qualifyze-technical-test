---
name: pw-test-spec
description: Automate a SauceDemo manual test case (TC-<FEATURE>-NNN, written in Gherkin) as a Playwright spec - fixtures, test data, Scenario Outline rows, title, traceability. Use when the user asks to automate, add, change or review an automated scenario, a spec, a fixture or test data.
---

# Test Specs from Manual Test Cases

Read `CLAUDE.md` first (conventions). Then:

1. Get the test case to automate from the user (ID, title, Gherkin). Note every `Given/When/Then` line, every Examples row and every expected value; verify each value against the live site.
2. Create/extend page objects with the skill `pw-page-object`.
3. Register new page objects in `src/common/fixtures.ts`, add data only if needed, write the spec.
4. Run and report with the skill `pw-run-report`.

## Files
```
src/common/fixtures.ts                 # one fixture per page object (single file for the whole project)
src/common/data/                       # shared test data (users, products)
src/features/<feature>/tests/<feature>.spec.ts
```
Keep it simple: no per-feature fixture or data files until the shared ones become hard to read.

### Fixtures (`src/common/fixtures.ts`)
```ts
export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
});
```
- Fixtures only construct page objects; they never navigate or act. Navigation and login are visible `given` steps in the spec.
- Each test gets a fresh browser context, so the cart starts empty: no cleanup or Reset App State needed unless the scenario tests it.

### Data
- Values come from the test case (users, form values, expected texts and amounts). Put them in `src/common/data/` only when used by a spec; otherwise keep the literal in the page call when it reads better.
- Expected amounts are the literal values of the test case, never recomputed from the UI.
- A Scenario Outline automates only the rows the user asked for. One row -> one plain test with the value in the title (no loop over a single-item array). Several rows -> an array of rows plus a loop.

### Spec (`tests/<feature>.spec.ts`)
```ts
import { test } from "../../../common/fixtures";
import { User } from "../../../common/data/users";

test.describe("Login", { tag: "@login" }, () => {
  test("[TC-LOGIN-001] Login with each accepted user - standard_user", async ({
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.givenIAmOnTheLoginPage();
    await loginPage.whenILogInAs(User.Standard);
    await inventoryPage.thenIAmRedirectedToTheInventoryPage();
    await inventoryPage.thenTheProductsTitleIsDisplayed();
  });
});
```

## Rules
- **Title**: `[TC-<FEATURE>-NNN] <exact title of the test case>`; Examples rows append ` - <value>`.
- **Tags**: only the feature tag, once, on the `test.describe` (`{ tag: "@login" }`); never on individual tests.
- **Never** `test.skip`, `test.fail`, `test.fixme` or weakened expectations to get a green run: if the product misbehaves, the test fails and the user decides.
- **Fidelity**: the spec follows the Gherkin line by line; every `Then`/`And` becomes a `then...` call. A line that combines two checks becomes two calls (e.g. "both buttons show Remove and the cart badge shows 2" -> `inventoryPage.thenTheButtonsShowRemove(...)` + `headerComponent.thenTheCartBadgeShows(2)`). Don't add checks the test case doesn't have: if the user wants an extra check, the user updates the manual test case first, then it is automated. Every check must be able to fail: if a step can't fail at that point in the flow (e.g. "no login error" after the redirect already happened), point it out and agree with the user before dropping it. If a check is impossible or ambiguous, stop and ask.
- **Spec body**: only fixture method calls. No locators, no `expect`, no `page.*`, no loops other than the Examples loop, no conditionals.
- **Independence**: no `test.describe.serial`, no shared state between tests, no order dependence; every test passes or fails on its own, in any browser, in parallel.
- **No `test.only`** left in code (ESLint `playwright/no-focused-test` blocks it).

## Done criteria
- `npm run typecheck` and `npm run lint` pass.
- The test passes on chromium, firefox and webkit, and fails when a check is broken on purpose (checked with `pw-run-report`).
- README "Automated scenarios" table updated (ID, title, priority).

Report back in English: test cases automated, files touched, results per browser, and any decision needed.
