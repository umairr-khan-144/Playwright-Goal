import type { APIResponse } from '@playwright/test';
import { ApiClient } from '../ApiClient';
import type { RegisterUserPayload } from '../../types/api.types';

/** API 11-14: create/update/delete a user account and fetch its detail by email. */
export class AccountApi {
  constructor(private readonly client: ApiClient) {}

  createAccount(payload: RegisterUserPayload): Promise<APIResponse> {
    return this.client.post('/createAccount', { form: { ...payload } });
  }

  deleteAccount(email: string, password: string): Promise<APIResponse> {
    return this.client.delete('/deleteAccount', { form: { email, password } });
  }

  updateAccount(payload: RegisterUserPayload): Promise<APIResponse> {
    return this.client.put('/updateAccount', { form: { ...payload } });
  }

  getUserDetailByEmail(email: string): Promise<APIResponse> {
    return this.client.get('/getUserDetailByEmail', { params: { email } });
  }
}
