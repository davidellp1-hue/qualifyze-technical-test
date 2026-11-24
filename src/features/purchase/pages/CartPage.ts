import { expect, Locator, Page, test } from "@playwright/test";
import { Product } from "../../../common/data/products";
import {
  expectListedNames,
  expectListedWithQuantityOne,
} from "../helpers/expectListedProducts";
import { quotedNames } from "../../../common/helpers/quotedNames";
import { findProductItem } from "../../../common/helpers/findProductItem";

export class CartPage {
  constructor(
    private readonly page: Page,
    private readonly pageTitle: Locator = page.getByTestId("title"),
    private readonly cartItems: Locator = page.getByTestId("inventory-item"),
    private readonly checkoutButton: Locator = page.getByTestId("checkout"),
  ) {}

  async whenIRemove(product: Product): Promise<void> {
    await test.step(`WHEN I remove "${product.name}"`, async () => {
      await findProductItem(this.cartItems, product)
        .getByRole("button", { name: "Remove", exact: true })
        .click();
    });
  }

  async whenIClickCheckout(): Promise<void> {
    await test.step('WHEN I click "Checkout"', async () => {
      await this.checkoutButton.click();
    });
  }

  async thenTheCartListsWithQuantityOne(products: Product[]): Promise<void> {
    await test.step(`THEN "Your Cart" lists ${quotedNames(products)} with qty 1 and the correct name, description and price`, async () => {
      await expect(this.page).toHaveURL(/\/cart\.html$/);
      await expect(this.pageTitle).toHaveText("Your Cart");
      await expectListedWithQuantityOne(this.cartItems, products);
      await expect(
        this.cartItems.getByTestId("inventory-item-desc"),
      ).toHaveText(products.map((product) => product.description));
      await expect(
        this.cartItems.getByTestId("inventory-item-price"),
      ).toHaveText(products.map((product) => product.price));
    });
  }

  async thenOnlyRemains(products: Product[]): Promise<void> {
    await test.step(`THEN only ${quotedNames(products)} remains`, async () => {
      await expectListedNames(this.cartItems, products);
    });
  }
}
