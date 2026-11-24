import { expect, Locator, Page, test } from "@playwright/test";

export class CheckoutInformationPage {
  constructor(
    private readonly page: Page,
    private readonly pageTitle: Locator = page.getByTestId("title"),
    private readonly firstNameInput: Locator = page.getByTestId("firstName"),
    private readonly lastNameInput: Locator = page.getByTestId("lastName"),
    private readonly postalCodeInput: Locator = page.getByTestId("postalCode"),
    private readonly continueButton: Locator = page.getByTestId("continue"),
  ) {}

  async whenIEnterMyInformationAndContinue(
    firstName: string,
    lastName: string,
    postalCode: string,
  ): Promise<void> {
    await test.step(`WHEN I enter "${firstName}", "${lastName}", "${postalCode}" and click "Continue"`, async () => {
      await this.firstNameInput.fill(firstName);
      await this.lastNameInput.fill(lastName);
      await this.postalCodeInput.fill(postalCode);
      await this.continueButton.click();
    });
  }

  async thenTheYourInformationPageIsDisplayed(): Promise<void> {
    await test.step('THEN the "Checkout: Your Information" page is displayed', async () => {
      await expect(this.page).toHaveURL(/\/checkout-step-one\.html$/);
      await expect(this.pageTitle).toHaveText("Checkout: Your Information");
    });
  }
}
