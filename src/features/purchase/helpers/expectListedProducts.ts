import { expect, Locator } from "@playwright/test";
import { Product } from "../../../common/data/products";

/** Cart or overview rows (`items`) show exactly these product names, in this order. */
export async function expectListedNames(
  items: Locator,
  products: Product[],
): Promise<void> {
  await expect(items.getByTestId("inventory-item-name")).toHaveText(
    products.map((product) => product.name),
  );
}

/** Cart or overview rows (`items`) show exactly these products, in this order, each with quantity 1. */
export async function expectListedWithQuantityOne(
  items: Locator,
  products: Product[],
): Promise<void> {
  await expectListedNames(items, products);
  await expect(items.getByTestId("item-quantity")).toHaveText(
    products.map(() => "1"),
  );
}
