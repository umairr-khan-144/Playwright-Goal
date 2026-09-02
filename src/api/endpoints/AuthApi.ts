import type { APIResponse } from '@playwright/test';
import { ApiClient } from '../ApiClient';

/** API 7-10: verify login with/without required parameters. */
export class AuthApi {
  constructor(private readonly client: ApiClient) {}

  verifyLogin(email: string, password: string): Promise<APIResponse> {
    return this.client.post('/verifyLogin', { form: { email, password } });
  }

  verifyLoginMissingEmail(password: string): Promise<APIResponse> {
    return this.client.post('/verifyLogin', { form: { password } });
  }

  deleteVerifyLogin(): Promise<APIResponse> {
    return this.client.delete('/verifyLogin', {});
  }
}
