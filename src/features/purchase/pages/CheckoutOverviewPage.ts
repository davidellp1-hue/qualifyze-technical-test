import { expect, Locator, Page, test } from "@playwright/test";
import { Product } from "../../../common/data/products";
import { expectListedWithQuantityOne } from "../helpers/expectListedProducts";
import { quotedNames } from "../../../common/helpers/quotedNames";

type Totals = { itemTotal: string; tax: string; total: string };

export class CheckoutOverviewPage {
  constructor(
    private readonly page: Page,
    private readonly pageTitle: Locator = page.getByTestId("title"),
    private readonly overviewItems: Locator = page.getByTestId(
      "inventory-item",
    ),
    private readonly itemTotalLabel: Locator = page.getByTestId(
      "subtotal-label",
    ),
    private readonly taxLabel: Locator = page.getByTestId("tax-label"),
    private readonly totalLabel: Locator = page.getByTestId("total-label"),
    private readonly finishButton: Locator = page.getByTestId("finish"),
  ) {}

  async whenIClickFinish(): Promise<void> {
    await test.step('WHEN I click "Finish"', async () => {
      await this.finishButton.click();
    });
  }

  async thenTheOverviewListsOnlyWithQuantityOne(
    products: Product[],
  ): Promise<void> {
    await test.step(`THEN the "Checkout: Overview" page lists only ${quotedNames(products)} with qty 1`, async () => {
      await expect(this.page).toHaveURL(/\/checkout-step-two\.html$/);
      await expect(this.pageTitle).toHaveText("Checkout: Overview");
      await expectListedWithQuantityOne(this.overviewItems, products);
    });
  }

  async thenTheTotalsAre({ itemTotal, tax, total }: Totals): Promise<void> {
    await test.step(`THEN it shows Item total "${itemTotal}", Tax "${tax}" and Total "${total}"`, async () => {
      await expect(this.itemTotalLabel).toHaveText(`Item total: ${itemTotal}`);
      await expect(this.taxLabel).toHaveText(`Tax: ${tax}`);
      await expect(this.totalLabel).toHaveText(`Total: ${total}`);
    });
  }
}
