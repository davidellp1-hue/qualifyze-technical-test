import { Product } from "../data/products";

/** Product names quoted for step texts: "A" and "B". */
export function quotedNames(products: Product[]): string {
  return products.map((product) => `"${product.name}"`).join(" and ");
}
