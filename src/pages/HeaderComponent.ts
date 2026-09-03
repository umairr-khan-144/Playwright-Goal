import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Encapsulates the persistent top navigation bar shared across every page. */
export class HeaderComponent extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  loggedInAs() {
    return this.page.getByText(/Logged in as/i);
  }

  private logoutLink() {
    return this.page.getByRole('link', { name: /logout/i });
  }

  private cartLink() {
    return this.page.getByRole('link', { name: /^\s*Cart\s*$/i });
  }

  async logout(): Promise<void> {
    await this.logoutLink().click();
  }

  async goToCart(): Promise<void> {
    await this.cartLink().click();
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      const locator = await this.resolveLocator(
        [
          () => this.page.getByText(/Logged in as/i),
          () => this.page.locator('a:has-text("Logged in as")'),
          () => this.page.locator('a[href="/logout"]'),
        ],
        'Logged-in indicator',
      );
      return await locator.first().isVisible();
    } catch {
      return false;
    }
  }
}
