import { test, expect } from '../../src/fixtures';
import { buildRegisterUserPayload } from '../../src/utils/test-data';

test.describe('@web @form Multi-step registration form', () => {
  test('@smoke completes all three steps of account registration', async ({
    page,
    loginPage,
    signupPage,
    header,
    accountApi,
  }) => {
    const user = buildRegisterUserPayload();

    // Step 1: initial name + email capture on the /login page
    await loginPage.goto();
    await loginPage.startSignup(user.name, user.email);

    // Step 2: detailed account + address information
    await expect(page.getByText('Enter Account Information')).toBeVisible();
    await signupPage.fillAccountInformation(user);
    await signupPage.submit();

    // Step 3: confirmation
    await expect(page.getByText('Account Created!')).toBeVisible();
    await signupPage.continueToHome();

    await expect(header.loggedInAs()).toContainText(user.name);

    await accountApi.deleteAccount(user.email, user.password);
  });

  test('@negative cannot advance past step two with a required field left empty', async ({
    page,
    loginPage,
    signupPage,
  }) => {
    const user = buildRegisterUserPayload({ firstname: '' });

    await loginPage.goto();
    await loginPage.startSignup(user.name, user.email);
    await signupPage.fillAccountInformation(user);
    await signupPage.submit();

    // Browser-native "required" validation should keep the user on step two
    await expect(page.getByText('Enter Account Information')).toBeVisible();
    await expect(page.getByText('Account Created!')).not.toBeVisible();
  });
});
