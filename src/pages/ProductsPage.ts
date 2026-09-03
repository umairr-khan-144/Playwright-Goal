import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * "Add to cart" and "View Product" render as plain non-semantic elements
 * (no link/button role) on this site, so getByText is the correct
 * user-facing strategy here per the allowed locator set.
 */
export class ProductsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private searchInput() {
    return this.page.getByPlaceholder('Search Product');
  }

  private searchButton() {
    return this.page.locator('#submit_search');
  }

  private productCards() {
    return this.page.locator('.product-image-wrapper');
  }

  private noProductsMessage() {
    return this.page.getByText(/no products found|not found/i);
  }

  private viewCartModalLink() {
    return this.page.getByRole('link', { name: 'View Cart' });
  }

  private continueShoppingButton() {
    return this.page.getByRole('button', { name: 'Continue Shopping' });
  }

  async goto(): Promise<void> {
    await this.navigateTo('/products');
  }

  async search(term: string): Promise<void> {
    await this.searchInput().fill(term);
    await this.searchButton().click();
  }

  productCardByName(name: string) {
    return this.productCards().filter({ hasText: name });
  }

  async addToCartByName(name: string): Promise<void> {
    const card = this.productCardByName(name);
    await card.getByText('Add to cart', { exact: true }).first().click();
  }

  async getResultCount(): Promise<number> {
    return this.productCards().count();
  }

  async hasNoProductsMessage(): Promise<boolean> {
    return this.noProductsMessage().isVisible();
  }

  async viewCartFromModal(): Promise<void> {
    await this.viewCartModalLink().click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton().click();
  }
}
