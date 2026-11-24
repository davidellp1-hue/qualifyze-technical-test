import { test } from "../../../common/fixtures";
import { User } from "../../../common/data/users";

test.describe("Login", { tag: "@login" }, () => {
  test("[TC-LOGIN-001] Login with each accepted user - standard_user", async ({
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.givenIAmOnTheLoginPage();
    await loginPage.whenILogInAs(User.Standard);
    await inventoryPage.thenIAmRedirectedToTheInventoryPage();
    await inventoryPage.thenTheProductsTitleIsDisplayed();
  });

  test("[TC-LOGIN-002] Locked-out user cannot log in", async ({
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.givenIAmOnTheLoginPage();
    await loginPage.whenILogInAs(User.LockedOut);
    await loginPage.thenIStayOnTheLoginPage();
    await loginPage.thenTheErrorIsDisplayed(
      "Epic sadface: Sorry, this user has been locked out.",
    );
    await loginPage.thenTheUsernameAndPasswordFieldsAreHighlightedAsErrors();

    await inventoryPage.whenIOpenTheInventoryPageDirectly();
    await loginPage.thenIAmRedirectedToTheLoginPage();
    await loginPage.thenTheErrorIsDisplayed(
      "Epic sadface: You can only access '/inventory.html' when you are logged in.",
    );
  });
});
