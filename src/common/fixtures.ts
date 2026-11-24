import { test as base } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";
import { InventoryPage } from "./pages/InventoryPage";
import { HeaderComponent } from "./pages/HeaderComponent";
import { CartPage } from "../features/checkout/pages/CartPage";
import { CheckoutInformationPage } from "../features/checkout/pages/CheckoutInformationPage";
import { CheckoutOverviewPage } from "../features/checkout/pages/CheckoutOverviewPage";
import { CheckoutCompletePage } from "../features/checkout/pages/CheckoutCompletePage";

type Fixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  headerComponent: HeaderComponent;
  cartPage: CartPage;
  checkoutInformationPage: CheckoutInformationPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  headerComponent: async ({ page }, use) => {
    await use(new HeaderComponent(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutInformationPage: async ({ page }, use) => {
    await use(new CheckoutInformationPage(page));
  },
  checkoutOverviewPage: async ({ page }, use) => {
    await use(new CheckoutOverviewPage(page));
  },
  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },
});
