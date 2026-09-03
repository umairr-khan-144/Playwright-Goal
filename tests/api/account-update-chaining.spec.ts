import { test, expect } from '../../src/fixtures';
import { buildRegisterUserPayload } from '../../src/utils/test-data';

/**
 * Chain: createAccount (A) -> updateAccount (B) with a changed name/address
 * -> getUserDetailByEmail (C) to assert the updated fields actually persisted
 * -> deleteAccount teardown.
 */
test.describe('@api @chaining Account update chaining', () => {
  test('@smoke updates an account and the change is reflected in a follow-up lookup', async ({ accountApi }) => {
    const user = buildRegisterUserPayload();

    const createResponse = await accountApi.createAccount(user);
    expect((await createResponse.json()).responseCode).toBe(201);

    // updateAccount is keyed by email + password together, so the password must
    // stay identical to the one used at creation or the API reports "Account not found!".
    const updatedUser = buildRegisterUserPayload({
      email: user.email,
      password: user.password,
      firstname: 'Updated',
      lastname: 'Name',
      city: 'Updated City',
    });

    const updateResponse = await accountApi.updateAccount(updatedUser);
    await expect(updateResponse).toBeOK();
    const updateBody = await updateResponse.json();
    expect(updateBody.responseCode).toBe(200);
    expect(updateBody.message).toBe('User updated!');

    const detailResponse = await accountApi.getUserDetailByEmail(user.email);
    const detailBody = await detailResponse.json();
    expect(detailBody.user.first_name).toBe('Updated');
    expect(detailBody.user.last_name).toBe('Name');
    expect(detailBody.user.city).toBe('Updated City');

    await accountApi.deleteAccount(user.email, user.password);
  });
});
