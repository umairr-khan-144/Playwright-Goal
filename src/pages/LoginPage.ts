import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * The /login route hosts two independent forms side by side: "Login to your
 * account" and "New User Signup!". Both forms expose a textbox named
 * "Email Address", so each form is scoped by its heading before drilling into
 * its own fields - this keeps every locator unambiguous and semantic.
 */
export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Each heading sits as a sibling of its <form> (not a parent), so the form
  // is scoped by walking from the heading to its next <form> sibling instead
  // of an ancestor/descendant filter.
  private loginForm() {
    return this.page
      .getByRole('heading', { name: 'Login to your account' })
      .locator('xpath=following-sibling::form[1]');
  }

  private signupForm() {
    return this.page.getByRole('heading', { name: 'New User Signup!' }).locator('xpath=following-sibling::form[1]');
  }

  private loginEmailInput() {
    return this.loginForm().getByPlaceholder('Email Address');
  }

  private loginPasswordInput() {
    return this.loginForm().getByPlaceholder('Password');
  }

  private loginButton() {
    return this.loginForm().getByRole('button', { name: 'Login' });
  }

  private loginErrorMessage() {
    return this.page.getByText('Your email or password is incorrect!');
  }

  private signupNameInput() {
    return this.signupForm().getByPlaceholder('Name');
  }

  private signupEmailInput() {
    return this.signupForm().getByPlaceholder('Email Address');
  }

  private signupButton() {
    return this.signupForm().getByRole('button', { name: 'Signup' });
  }

  private signupErrorMessage() {
    return this.page.getByText('Email Address already exist!');
  }

  async goto(): Promise<void> {
    await this.navigateTo('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.loginEmailInput().fill(email);
    await this.loginPasswordInput().fill(password);
    await this.loginButton().click();
  }

  async startSignup(name: string, email: string): Promise<void> {
    await this.signupNameInput().fill(name);
    await this.signupEmailInput().fill(email);
    await this.signupButton().click();
  }

  loginErrorLocator() {
    return this.loginErrorMessage();
  }

  signupErrorLocator() {
    return this.signupErrorMessage();
  }

  async isLoginErrorVisible(): Promise<boolean> {
    return this.loginErrorMessage().isVisible();
  }

  async isSignupErrorVisible(): Promise<boolean> {
    return this.signupErrorMessage().isVisible();
  }
}
