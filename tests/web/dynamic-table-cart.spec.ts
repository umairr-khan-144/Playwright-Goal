import { test, expect } from '../../src/fixtures';

test.describe('@web @cart Dynamic data table - shopping cart', () => {
  test('@smoke adds products and reflects them as new rows in the cart table', async ({ productsPage, cartPage }) => {
    await productsPage.goto();
    await productsPage.addToCartByName('Blue Top');
    await productsPage.continueShopping();
    await productsPage.addToCartByName('Men Tshirt');
    await productsPage.viewCartFromModal();

    await expect.poll(() => cartPage.getRowCount()).toBe(2);
    expect(await cartPage.isProductPresent('Blue Top')).toBe(true);
    expect(await cartPage.isProductPresent('Men Tshirt')).toBe(true);
  });

  test('@regression removes a single row and the table re-renders dynamically', async ({ productsPage, cartPage }) => {
    await productsPage.goto();
    await productsPage.addToCartByName('Blue Top');
    await productsPage.continueShopping();
    await productsPage.addToCartByName('Men Tshirt');
    await productsPage.viewCartFromModal();

    await expect.poll(() => cartPage.getRowCount()).toBe(2);

    await cartPage.removeProduct('Blue Top');

    await expect.poll(() => cartPage.getRowCount()).toBe(1);
    expect(await cartPage.isProductPresent('Blue Top')).toBe(false);
    expect(await cartPage.isProductPresent('Men Tshirt')).toBe(true);
  });

  test('@negative shows the empty-cart state once every row has been removed', async ({ productsPage, cartPage }) => {
    await productsPage.goto();
    await productsPage.addToCartByName('Blue Top');
    await productsPage.viewCartFromModal();

    await cartPage.removeProduct('Blue Top');

    await expect.poll(() => cartPage.isCartEmpty()).toBe(true);
    expect(await cartPage.getRowCount()).toBe(0);
  });
});
