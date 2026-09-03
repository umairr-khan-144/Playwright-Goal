import { test, expect } from '../../src/fixtures';
import { buildRegisterUserPayload } from '../../src/utils/test-data';

/**
 * Chain: createAccount (A) -> verifyLogin succeeds (B) -> deleteAccount (C)
 * -> verifyLogin again (D) now fails, proving the delete's end state via a
 * fourth chained call reusing the same account identity.
 */
test.describe('@api @chaining Account deletion chaining', () => {
  test('@smoke deleting an account invalidates subsequent login attempts', async ({ accountApi, authApi }) => {
    const user = buildRegisterUserPayload();

    await accountApi.createAccount(user);

    const firstLogin = await authApi.verifyLogin(user.email, user.password);
    expect((await firstLogin.json()).message).toBe('User exists!');

    const deleteResponse = await accountApi.deleteAccount(user.email, user.password);
    await expect(deleteResponse).toBeOK();
    expect((await deleteResponse.json()).message).toBe('Account deleted!');

    // This API always answers with HTTP 200; the real outcome is carried in body.responseCode.
    const secondLogin = await authApi.verifyLogin(user.email, user.password);
    expect(secondLogin.ok()).toBe(true);
    const secondLoginBody = await secondLogin.json();
    expect(secondLoginBody.responseCode).toBe(404);
    expect(secondLoginBody.message).not.toBe('User exists!');
  });
});
