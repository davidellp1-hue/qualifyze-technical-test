---
name: pw-page-object
description: Write and maintain Page Objects and shared components for the SauceDemo Playwright project - file location, class pattern, data-test/role locators, given/when/then methods wrapped in test.step, web-first assertions. Use when creating, extending, refactoring or reviewing any class under src/common/pages or src/features/*/pages, any helper under */helpers, or when a locator needs to be added or fixed.
---

# Page Objects

Read `CLAUDE.md` first. Page objects hold **all** locators, actions and assertions; specs only call page methods.

## Location
- `src/features/<feature>/pages/<name>Page.ts` when only that feature uses it.
- `src/common/pages/` when 2+ features use it (e.g. `LoginPage`, `InventoryPage`, `HeaderComponent` for the cart link and badge). Move a page to `common` the moment a second feature needs it; never duplicate it.
- Screens -> classes: `LoginPage` (`/`), `InventoryPage` (`/inventory.html`), `CartPage` (`/cart.html`), `CheckoutInformationPage` (`/checkout-step-one.html`), `CheckoutOverviewPage` (`/checkout-step-two.html`), `CheckoutCompletePage` (`/checkout-complete.html`), `HeaderComponent` (header of every inner page). Name a new screen the same way (`<Screen>Page`).
- Create a class only when a test needs it, with only the locators/methods that test uses.

## Class pattern
```ts
import { Locator, Page, test } from "@playwright/test";
import { Product } from "../../../common/data/products";
import { findProductItem } from "../../../common/helpers/findProductItem";

export class CartPage {
  constructor(
    page: Page,
    private readonly cartItems: Locator = page.getByTestId("inventory-item"),
    private readonly checkoutButton: Locator = page.getByTestId("checkout"),
  ) {}

  async whenIClickCheckout(): Promise<void> {
    await test.step('WHEN I click "Checkout"', async () => {
      await this.checkoutButton.click();
    });
  }

  async whenIRemove(product: Product): Promise<void> {
    await test.step(`WHEN I remove "${product.name}"`, async () => {
      await findProductItem(this.cartItems, product).getByRole("button", { name: "Remove", exact: true }).click();
    });
  }
}
```
- Constructor receives the Playwright `page` first, as `private readonly page` only if a method uses `this.page` (otherwise plain `page: Page`, so there is no unused field); static locators follow as `private readonly` parameter properties with a default value built from `page` (one line per locator). Callers only ever pass `page`; never pass locators from outside. Don't use field initialisers with `this.page` (TypeScript 6 initialises fields before parameter properties). A locator that depends on a parameter (e.g. a product) comes from a helper (`findProductItem`).
- Helpers are plain functions, one file per topic, placed like pages: `src/features/<feature>/helpers/` when only that feature uses them, `src/common/helpers/` when 2+ features do. Never re-implement an existing one in a page. Current helpers: `common/helpers/findProductItem(items, product)` finds a product card / cart row by name; `common/helpers/quotedNames(products)` formats product names for step texts; `features/purchase/helpers/expectListedProducts.ts` (`expectListedNames`, `expectListedWithQuantityOne`) checks a cart or overview list. A helper may contain `expect` only if it is called from inside a `then` method. A URL regex used twice in a class is a module constant (`INVENTORY_URL`).
- No base class, no wrapper around `page`: add one only when 2+ page objects need the same behaviour.
- Constructor never performs actions. Navigation is its own method (`givenIAmOnTheLoginPage`, `whenIOpenTheInventoryPageDirectly`).

## Method naming and steps
| Prefix | Purpose | Step text | Asserts? |
|---|---|---|---|
| `given...` | Precondition / setup through the UI | `GIVEN ...` | Only to confirm the precondition holds |
| `when...` | One user action (may be several clicks) | `WHEN I ...` | No |
| `then...` | Observable expected result | `THEN ...` | Yes, web-first only |

- Each public method wraps its body in exactly one `test.step` whose text mirrors the Gherkin line of the test case, with real values interpolated (product names, user, amounts).
- First person everywhere, like the Gherkin: method names (`givenIAmOnTheLoginPage`, `whenILogInAs`) and step texts (`GIVEN I am on the login page`, `WHEN I log in as "standard_user"`).
- Keep methods at the granularity of a Gherkin line, so a spec reads like the scenario.
- Two Gherkin lines with the same check but a different meaning (e.g. "I stay on the login page" / "I am redirected to the login page") are two public methods sharing one private check.

## Locators (priority order)
1. `page.getByTestId("...")` — SauceDemo `data-test` (config sets `testIdAttribute: "data-test"`).
2. `page.getByRole(role, { name })` — when no `data-test` exists.
3. `getByText` / `getByPlaceholder` / `getByLabel` — user-visible text as a last resort.
4. CSS only if nothing above works, with a short reason in a comment. **Never XPath.**

Rules:
- Scope repeated elements to their container with `filter({ has: ... })` / `filter({ hasText: ... })` instead of `nth()`/`first()`. `first()`/`nth()` only when order *is* the behaviour under test (e.g. sorting).
- Verify every locator against the live DOM before using it (`npx playwright codegen https://www.saucedemo.com` or the Playwright inspector); never guess ids.
- Known SauceDemo quirks (verify, they may change):
  - Inside a product card, the image and title links have `role="button"`: look buttons up by exact name (`getByRole("button", { name: "Remove", exact: true })`), never by role alone.
  - Cart, overview and inventory rows all use `data-test="inventory-item"`; find one by product name with `findProductItem`.
  - Login inputs always carry the class `input_error`; a failed login adds the class `error` (check it with `toContainClass("error")`).

## Assertions and waiting
- Only web-first assertions: `await expect(locator).toHaveText/toBeVisible/toHaveCount/toHaveValue`, `await expect(page).toHaveURL(...)`. Never `expect(await locator.textContent())`.
- Exact expected values (texts, prices, totals, URLs) come from the test case and the shared data files, never re-read from the UI and compared with itself.
- No `waitForTimeout`, no `waitForLoadState("networkidle")`, no manual retry loops: Playwright auto-waits.
- Absence: `await expect(locator).toHaveCount(0)` or `.toBeHidden()`.

## Review checklist
- [ ] Only methods and locators that a current test uses (KISS).
- [ ] Right folder (common vs feature), no duplicated page/locator.
- [ ] No XPath, no unscoped `first()`/`nth()`, no hard waits.
- [ ] Every public method has one `test.step` with GIVEN/WHEN/THEN text.
- [ ] `when` methods don't assert; `then` methods do.
- [ ] Types explicit on public methods; no `any`; lint and typecheck pass.

Report back in English: classes/methods added or changed and any locator that could not be verified.
