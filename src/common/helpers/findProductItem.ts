import { Locator } from "@playwright/test";
import { Product } from "../data/products";

/** The product card or cart row (one of `items`) whose name is exactly the product's name. */
export function findProductItem(items: Locator, product: Product): Locator {
  return items.filter({
    has: items
      .page()
      .getByTestId("inventory-item-name")
      .getByText(product.name, { exact: true }),
  });
}
