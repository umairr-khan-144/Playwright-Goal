import type { APIRequestContext, APIResponse } from '@playwright/test';
import { logApiRequest, logApiResponse } from '../utils/logger';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface ApiRequestOptions {
  params?: Record<string, string | number>;
  form?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
}

/**
 * Thin wrapper around a single, persistent Playwright APIRequestContext.
 * Every endpoint class shares one instance so cookies/auth headers picked up
 * by one call (e.g. login) are automatically reused by every chained call
 * that follows, and every request/response is centrally logged.
 */
export class ApiClient {
  constructor(
    private readonly context: APIRequestContext,
    private readonly baseUrl: string,
  ) {}

  async request(method: HttpMethod, path: string, options: ApiRequestOptions = {}): Promise<APIResponse> {
    const url = `${this.baseUrl}${path}`;
    logApiRequest(method, url, { params: options.params, form: options.form });

    const response = await this.context.fetch(url, {
      method,
      params: options.params,
      form: options.form,
      headers: options.headers,
    });

    await logApiResponse(method, url, response);
    return response;
  }

  get(path: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.request('GET', path, options);
  }

  post(path: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.request('POST', path, options);
  }

  put(path: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.request('PUT', path, options);
  }

  delete(path: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.request('DELETE', path, options);
  }
}
