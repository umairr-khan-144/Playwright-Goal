import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * The shopping cart is rendered as a genuine dynamic HTML <table>: rows are
 * added/removed client-side as products are added/removed, without a full
 * page reload, which makes it a good "dynamic data table" scenario.
 */
export class CartPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private cartTable() {
    return this.page.locator('#cart_info_table');
  }

  private rows() {
    return this.cartTable().locator('tbody tr');
  }

  private emptyCartMessage() {
    return this.page.getByText('Cart is empty!');
  }

  private proceedToCheckoutButton() {
    return this.page.getByText('Proceed To Checkout', { exact: true });
  }

  async goto(): Promise<void> {
    await this.navigateTo('/view_cart');
  }

  rowByProductName(name: string) {
    return this.rows().filter({ hasText: name });
  }

  async getRowCount(): Promise<number> {
    return this.rows().count();
  }

  async getQuantity(name: string): Promise<string> {
    return ((await this.rowByProductName(name).locator('.cart_quantity button').textContent()) ?? '').trim();
  }

  async getPrice(name: string): Promise<string> {
    return ((await this.rowByProductName(name).locator('.cart_price p').textContent()) ?? '').trim();
  }

  /** The delete icon has no accessible role/name on this site - CSS class is the only reliable hook. */
  async removeProduct(name: string): Promise<void> {
    await this.rowByProductName(name).locator('.cart_quantity_delete').click();
  }

  async isProductPresent(name: string): Promise<boolean> {
    return (await this.rowByProductName(name).count()) > 0;
  }

  async isCartEmpty(): Promise<boolean> {
    return this.emptyCartMessage().isVisible();
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedToCheckoutButton().click();
  }
}
