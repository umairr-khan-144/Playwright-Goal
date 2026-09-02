import { test as base, request, type APIRequestContext } from '@playwright/test';
import { ApiClient } from '../api/ApiClient';
import { AccountApi } from '../api/endpoints/AccountApi';
import { AuthApi } from '../api/endpoints/AuthApi';
import { ProductApi } from '../api/endpoints/ProductApi';
import { env } from '../config/env';

export interface ApiFixtures {
  apiRequestContext: APIRequestContext;
  apiClient: ApiClient;
  accountApi: AccountApi;
  authApi: AuthApi;
  productApi: ProductApi;
}

/**
 * All API fixtures are worker-scoped: a single APIRequestContext is created
 * once per worker and reused by every test/chained call in that worker, so
 * cookies and auth state picked up by one request persist to the next.
 */
export const apiTest = base.extend<object, ApiFixtures>({
  apiRequestContext: [
    async ({}, use) => {
      const context = await request.newContext({
        extraHTTPHeaders: { Accept: 'application/json' },
      });
      await use(context);
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  apiClient: [
    async ({ apiRequestContext }, use) => {
      await use(new ApiClient(apiRequestContext, env.API_BASE_URL));
    },
    { scope: 'worker' },
  ],

  accountApi: [
    async ({ apiClient }, use) => {
      await use(new AccountApi(apiClient));
    },
    { scope: 'worker' },
  ],

  authApi: [
    async ({ apiClient }, use) => {
      await use(new AuthApi(apiClient));
    },
    { scope: 'worker' },
  ],

  productApi: [
    async ({ apiClient }, use) => {
      await use(new ProductApi(apiClient));
    },
    { scope: 'worker' },
  ],
});
