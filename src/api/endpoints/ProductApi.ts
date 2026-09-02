import type { APIResponse } from '@playwright/test';
import { ApiClient } from '../ApiClient';

/** API 1-6: products/brands listing and product search. */
export class ProductApi {
  constructor(private readonly client: ApiClient) {}

  getAllProducts(): Promise<APIResponse> {
    return this.client.get('/productsList');
  }

  getAllBrands(): Promise<APIResponse> {
    return this.client.get('/brandsList');
  }

  searchProduct(searchTerm: string): Promise<APIResponse> {
    return this.client.post('/searchProduct', { form: { search_product: searchTerm } });
  }

  searchProductWithoutParam(): Promise<APIResponse> {
    return this.client.post('/searchProduct', { form: {} });
  }
}
