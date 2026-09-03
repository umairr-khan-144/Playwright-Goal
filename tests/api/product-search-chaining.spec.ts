import { test, expect } from '../../src/fixtures';

/**
 * Chain: getAllProducts (A) -> extract a real product name from the response
 * -> searchProduct (B) using that name -> assert the search result contains
 * the same product (end state validated by an id/name carried across calls).
 */
test.describe('@api @chaining Product search chaining', () => {
  test('@smoke searches for a product discovered from the products list', async ({ productApi }) => {
    const listResponse = await productApi.getAllProducts();
    await expect(listResponse).toBeOK();
    const listBody = await listResponse.json();
    expect(listBody.responseCode).toBe(200);
    expect(Array.isArray(listBody.products)).toBe(true);
    expect(listBody.products.length).toBeGreaterThan(0);

    const [firstProduct] = listBody.products;

    const searchResponse = await productApi.searchProduct(firstProduct.name);
    await expect(searchResponse).toBeOK();
    const searchBody = await searchResponse.json();
    expect(searchBody.responseCode).toBe(200);
    expect(searchBody.products.some((p: { id: number }) => p.id === firstProduct.id)).toBe(true);
  });

  test('@negative rejects a search request without the search_product parameter', async ({ productApi }) => {
    // This API always answers with HTTP 200; the real outcome is carried in body.responseCode.
    const response = await productApi.searchProductWithoutParam();

    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body.responseCode).toBe(400);
    expect(body.message).toContain('search_product parameter is missing');
  });

  test('@regression fetches the brands list successfully', async ({ productApi }) => {
    const response = await productApi.getAllBrands();

    await expect(response).toBeOK();
    const body = await response.json();
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.brands)).toBe(true);
  });
});
