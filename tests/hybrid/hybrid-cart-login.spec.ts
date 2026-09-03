import { test, expect } from '../../src/fixtures';
import { buildRegisterUserPayload } from '../../src/utils/test-data';

/**
 * Hybrid pattern: the API creates (setup) and later deletes (teardown) the
 * test account, while the UI performs the actual scenario under test - login
 * with that account and add a product to the cart.
 */
test.describe('@hybrid @regression Hybrid API setup + UI scenario', () => {
  test('@smoke logs in via the UI with an API-provisioned account and adds a product to the cart', async ({
    accountApi,
    loginPage,
    header,
    productsPage,
    cartPage,
  }) => {
    const user = buildRegisterUserPayload();

    // --- API setup: provision the account without touching the UI ---
    const createResponse = await accountApi.createAccount(user);
    expect((await createResponse.json()).responseCode).toBe(201);

    // --- UI: the actual scenario under test ---
    await loginPage.goto();
    await loginPage.login(user.email, user.password);
    await expect(header.loggedInAs()).toContainText(user.name);

    await productsPage.goto();
    await productsPage.addToCartByName('Blue Top');
    await productsPage.viewCartFromModal();

    expect(await cartPage.isProductPresent('Blue Top')).toBe(true);

    await header.logout();

    // --- API teardown: remove the account regardless of UI outcome ---
    await accountApi.deleteAccount(user.email, user.password);
  });
});
