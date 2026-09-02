import { test, expect } from '../../src/fixtures';
import { buildRegisterUserPayload } from '../../src/utils/test-data';

test.describe('@web @auth Authentication', () => {
  test('@smoke registers a new account and logs the user in', async ({ page, loginPage, signupPage, header, accountApi }) => {
    const user = buildRegisterUserPayload();

    await loginPage.goto();
    await loginPage.startSignup(user.name, user.email);
    await signupPage.fillAccountInformation(user);
    await signupPage.submit();

    await expect(page.getByText('Account Created!')).toBeVisible();
    await signupPage.continueToHome();

    await expect(header.loggedInAs()).toContainText(user.name);
    expect(await header.isLoggedIn()).toBe(true);

    await header.logout();
    await expect(page).toHaveURL(/\/login/);

    await accountApi.deleteAccount(user.email, user.password);
  });

  test('@regression logs an existing account out and back in', async ({ page, loginPage, signupPage, header, accountApi }) => {
    const user = buildRegisterUserPayload();

    await loginPage.goto();
    await loginPage.startSignup(user.name, user.email);
    await signupPage.fillAccountInformation(user);
    await signupPage.submit();
    await signupPage.continueToHome();
    await header.logout();

    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    await expect(header.loggedInAs()).toContainText(user.name);

    await header.logout();
    await expect(page).toHaveURL(/\/login/);

    await accountApi.deleteAccount(user.email, user.password);
  });
});
