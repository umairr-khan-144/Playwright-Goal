import { test, expect } from '../../src/fixtures';
import { buildRegisterUserPayload } from '../../src/utils/test-data';

test.describe('@web @negative Error boundary & negative handling', () => {
  test('rejects login with invalid credentials without crashing the page', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login('not-a-real-user@example.test', 'WrongPassword123!');

    await expect(loginPage.loginErrorLocator()).toBeVisible();
    // The page shell must still be intact - no white-screen crash.
    await expect(page.getByRole('link', { name: 'Signup / Login' })).toBeVisible();
  });

  test('blocks signup with an email that is already registered', async ({
    loginPage,
    signupPage,
    header,
    accountApi,
  }) => {
    const user = buildRegisterUserPayload();

    await loginPage.goto();
    await loginPage.startSignup(user.name, user.email);
    await signupPage.fillAccountInformation(user);
    await signupPage.submit();
    await signupPage.continueToHome();

    // Must log out first: the /login page only renders the signup/login forms
    // for anonymous visitors, not for an already-authenticated user.
    await header.logout();
    await loginPage.goto();
    await loginPage.startSignup(user.name, user.email);

    await expect(loginPage.signupErrorLocator()).toBeVisible();

    await accountApi.deleteAccount(user.email, user.password);
  });

  test('gracefully shows an empty state for a search term that matches nothing', async ({ productsPage }) => {
    await productsPage.goto();
    await productsPage.search('zzz-nonexistent-product-zzz');

    expect(await productsPage.getResultCount()).toBe(0);
  });

  test('survives a forced backend failure on the add-to-cart call without an unhandled exception', async ({
    page,
    productsPage,
  }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    await productsPage.goto();
    await page.route('**/add_to_cart/**', (route) => route.fulfill({ status: 500, body: 'Internal Server Error' }));

    // Best-effort click: whether or not the app shows a modal, it must not throw.
    await productsPage.addToCartByName('Blue Top').catch(() => undefined);

    expect(pageErrors).toHaveLength(0);
  });
});
