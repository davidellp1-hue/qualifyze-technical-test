import { expect, Locator, Page, test } from "@playwright/test";
import { Product } from "../data/products";
import { quotedNames } from "../helpers/quotedNames";
import { findProductItem } from "../helpers/findProductItem";

const INVENTORY_URL = /\/inventory\.html$/;

export class InventoryPage {
  constructor(
    private readonly page: Page,
    private readonly pageTitle: Locator = page.getByTestId("title"),
    private readonly inventoryItems: Locator = page.getByTestId(
      "inventory-item",
    ),
  ) {}

  async whenIOpenTheInventoryPageDirectly(): Promise<void> {
    await test.step('WHEN I open "/inventory.html" directly', async () => {
      await this.page.goto("/inventory.html");
    });
  }

  async whenIAddToCart(products: Product[]): Promise<void> {
    await test.step(`WHEN I add ${quotedNames(products)} to the cart`, async () => {
      for (const product of products) {
        await findProductItem(this.inventoryItems, product)
          .getByRole("button", { name: "Add to cart", exact: true })
          .click();
      }
    });
  }

  async thenIAmRedirectedToTheInventoryPage(): Promise<void> {
    await test.step('THEN I am redirected to "/inventory.html"', async () => {
      await expect(this.page).toHaveURL(INVENTORY_URL);
    });
  }

  async thenTheProductsTitleIsDisplayed(): Promise<void> {
    await test.step('THEN the title "Products" is displayed', async () => {
      await expect(this.pageTitle).toHaveText("Products");
    });
  }

  async thenTheButtonsShowRemove(products: Product[]): Promise<void> {
    await test.step(`THEN the buttons of ${quotedNames(products)} show "Remove"`, async () => {
      for (const product of products) {
        await expect(
          findProductItem(this.inventoryItems, product).getByRole("button", {
            name: "Remove",
            exact: true,
          }),
        ).toBeVisible();
      }
    });
  }

  async thenEveryButtonShowsAddToCart(): Promise<void> {
    await test.step('THEN the inventory page is displayed with every button showing "Add to cart"', async () => {
      await expect(this.page).toHaveURL(INVENTORY_URL);
      await expect(this.pageTitle).toHaveText("Products");
      await expect(
        this.inventoryItems.getByRole("button", {
          name: "Remove",
          exact: true,
        }),
      ).toHaveCount(0);
    });
  }
}
