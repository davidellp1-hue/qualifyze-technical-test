import { expect, Locator, Page, test } from "@playwright/test";

export class HeaderComponent {
  constructor(
    page: Page,
    private readonly cartLink: Locator = page.getByTestId("shopping-cart-link"),
    private readonly cartBadge: Locator = page.getByTestId(
      "shopping-cart-badge",
    ),
  ) {}

  async givenMyCartIsEmpty(): Promise<void> {
    await test.step("GIVEN my cart is empty", async () => {
      await expect(this.cartBadge).toBeHidden();
    });
  }

  async whenIOpenTheCart(): Promise<void> {
    await test.step("WHEN I open the cart", async () => {
      await this.cartLink.click();
    });
  }

  async thenTheCartBadgeShows(count: number): Promise<void> {
    await test.step(`THEN the cart badge shows "${count}"`, async () => {
      await expect(this.cartBadge).toHaveText(String(count));
    });
  }

  async thenTheCartBadgeIsGone(): Promise<void> {
    await test.step("THEN the cart badge is gone", async () => {
      await expect(this.cartBadge).toBeHidden();
    });
  }
}
