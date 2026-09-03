import { test, expect } from '../../src/fixtures';
import { buildRegisterUserPayload } from '../../src/utils/test-data';

/**
 * Chain: createAccount (A) -> extract email/password -> verifyLogin (B) using
 * them -> getUserDetailByEmail (C) to assert the end state -> deleteAccount
 * teardown. All three calls reuse the same persistent APIRequestContext.
 */
test.describe('@api @chaining Auth token / account chaining', () => {
  test('@smoke registers a user then verifies login and account detail end-to-end', async ({
    accountApi,
    authApi,
  }) => {
    const user = buildRegisterUserPayload();

    const createResponse = await accountApi.createAccount(user);
    expect(createResponse.ok()).toBe(true);
    const createBody = await createResponse.json();
    expect(createBody.responseCode).toBe(201);
    expect(createBody.message).toBe('User created!');

    const loginResponse = await authApi.verifyLogin(user.email, user.password);
    expect(loginResponse.ok()).toBe(true);
    const loginBody = await loginResponse.json();
    expect(loginBody.responseCode).toBe(200);
    expect(loginBody.message).toBe('User exists!');

    const detailResponse = await accountApi.getUserDetailByEmail(user.email);
    expect(detailResponse.ok()).toBe(true);
    const detailBody = await detailResponse.json();
    expect(detailBody.responseCode).toBe(200);
    expect(detailBody.user.email).toBe(user.email);
    expect(detailBody.user.name).toBe(user.name);

    const deleteResponse = await accountApi.deleteAccount(user.email, user.password);
    expect(deleteResponse.ok()).toBe(true);
  });

  test('@negative rejects verifyLogin when the email parameter is missing', async ({ authApi }) => {
    // This API always answers with HTTP 200; the real outcome is carried in body.responseCode.
    const response = await authApi.verifyLoginMissingEmail('SomePassword123!');

    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body.responseCode).toBe(400);
    expect(body.message).toContain('missing');
  });
});
