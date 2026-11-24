import { expect, Locator, Page, test } from "@playwright/test";

export class CheckoutCompletePage {
  constructor(
    private readonly page: Page,
    private readonly pageTitle: Locator = page.getByTestId("title"),
    private readonly completeHeader: Locator = page.getByTestId(
      "complete-header",
    ),
    private readonly backHomeButton: Locator = page.getByTestId(
      "back-to-products",
    ),
  ) {}

  async whenIClickBackHome(): Promise<void> {
    await test.step('WHEN I click "Back Home"', async () => {
      await this.backHomeButton.click();
    });
  }

  async thenTheOrderIsConfirmed(): Promise<void> {
    await test.step('THEN "/checkout-complete.html" shows "Checkout: Complete!" and "Thank you for your order!"', async () => {
      await expect(this.page).toHaveURL(/\/checkout-complete\.html$/);
      await expect(this.pageTitle).toHaveText("Checkout: Complete!");
      await expect(this.completeHeader).toHaveText("Thank you for your order!");
    });
  }
}
