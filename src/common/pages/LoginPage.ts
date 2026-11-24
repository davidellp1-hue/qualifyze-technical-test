import { expect, Locator, Page, test } from "@playwright/test";
import { PASSWORD, User } from "../data/users";

export class LoginPage {
  constructor(
    private readonly page: Page,
    private readonly usernameInput: Locator = page.getByTestId("username"),
    private readonly passwordInput: Locator = page.getByTestId("password"),
    private readonly loginButton: Locator = page.getByTestId("login-button"),
    private readonly errorMessage: Locator = page.getByTestId("error"),
  ) {}

  async givenIAmOnTheLoginPage(): Promise<void> {
    await test.step("GIVEN I am on the login page", async () => {
      await this.openLoginPage();
    });
  }

  async givenIAmLoggedInAs(user: User): Promise<void> {
    await test.step(`GIVEN I am logged in as "${user}"`, async () => {
      await this.openLoginPage();
      await this.logIn(user);
      await expect(this.loginButton).toBeHidden();
    });
  }

  async whenILogInAs(user: User): Promise<void> {
    await test.step(`WHEN I log in as "${user}"`, async () => {
      await this.logIn(user);
    });
  }

  async thenIStayOnTheLoginPage(): Promise<void> {
    await test.step("THEN I stay on the login page", async () => {
      await this.expectLoginPage();
    });
  }

  async thenIAmRedirectedToTheLoginPage(): Promise<void> {
    await test.step("THEN I am redirected to the login page", async () => {
      await this.expectLoginPage();
    });
  }

  async thenTheErrorIsDisplayed(message: string): Promise<void> {
    await test.step(`THEN the error "${message}" is displayed`, async () => {
      await expect(this.errorMessage).toHaveText(message);
    });
  }

  async thenTheUsernameAndPasswordFieldsAreHighlightedAsErrors(): Promise<void> {
    await test.step("THEN the username and password fields are highlighted as errors", async () => {
      await expect(this.usernameInput).toContainClass("error");
      await expect(this.passwordInput).toContainClass("error");
    });
  }

  private async expectLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL("/");
    await expect(this.loginButton).toBeVisible();
  }

  private async openLoginPage(): Promise<void> {
    await this.page.goto("/");
    await this.expectLoginPage();
  }

  private async logIn(user: User): Promise<void> {
    await this.usernameInput.fill(user);
    await this.passwordInput.fill(PASSWORD);
    await this.loginButton.click();
  }
}
