import { test } from "../../../common/fixtures";
import { User } from "../../../common/data/users";
import { Products } from "../../../common/data/products";

test.describe("Purchase", () => {
  test("[TC-CHK-001] End-to-end purchase: add 2, remove 1, checkout, finish", async ({
    loginPage,
    inventoryPage,
    headerComponent,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    await loginPage.givenIAmLoggedInAs(User.Standard);
    await headerComponent.givenMyCartIsEmpty();

    await inventoryPage.whenIAddToCart([Products.Backpack, Products.BikeLight]);
    await inventoryPage.thenTheButtonsShowRemove([
      Products.Backpack,
      Products.BikeLight,
    ]);
    await headerComponent.thenTheCartBadgeShows(2);

    await headerComponent.whenIOpenTheCart();
    await cartPage.thenTheCartListsWithQuantityOne([
      Products.Backpack,
      Products.BikeLight,
    ]);

    await cartPage.whenIRemove(Products.BikeLight);
    await cartPage.thenOnlyRemains([Products.Backpack]);
    await headerComponent.thenTheCartBadgeShows(1);

    await cartPage.whenIClickCheckout();
    await checkoutInformationPage.thenTheYourInformationPageIsDisplayed();

    await checkoutInformationPage.whenIEnterMyInformationAndContinue(
      "John",
      "Doe",
      "08001",
    );
    await checkoutOverviewPage.thenTheOverviewListsOnlyWithQuantityOne([
      Products.Backpack,
    ]);
    await checkoutOverviewPage.thenTheTotalsAre({
      itemTotal: "$29.99",
      tax: "$2.40",
      total: "$32.39",
    });

    await checkoutOverviewPage.whenIClickFinish();
    await checkoutCompletePage.thenTheOrderIsConfirmed();
    await headerComponent.thenTheCartBadgeIsGone();

    await checkoutCompletePage.whenIClickBackHome();
    await inventoryPage.thenEveryButtonShowsAddToCart();
    await headerComponent.thenTheCartBadgeIsGone();
  });
});
