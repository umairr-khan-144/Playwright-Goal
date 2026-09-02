import { test as base } from '@playwright/test';
import { HeaderComponent } from '../pages/HeaderComponent';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';

export interface PageFixtures {
  header: HeaderComponent;
  loginPage: LoginPage;
  signupPage: SignupPage;
  productsPage: ProductsPage;
  cartPage: CartPage;
}

const AD_HOST_PATTERNS = [
  'doubleclick.net',
  'googlesyndication.com',
  'google.com/ads',
  'googleadservices.com',
  'adsrvr.org',
  'pagead2.googlesyndication.com',
];

/** One Page Object instance per test, each wired to that test's own `page`. */
export const pageTest = base.extend<PageFixtures & { blockAdNetworks: void }>({
  // automationexercise.com is ad-supported; third-party ad/interstitial traffic is a
  // real source of flakiness (slow loads, click-intercepting overlays) unrelated to
  // the app under test, so it is blocked for every test that uses `page`.
  blockAdNetworks: [
    async ({ page }, use) => {
      await page.route('**/*', (route) => {
        const url = route.request().url();
        if (AD_HOST_PATTERNS.some((host) => url.includes(host))) {
          return route.abort();
        }
        return route.continue();
      });
      await use();
    },
    { auto: true },
  ],

  header: async ({ page }, use) => {
    await use(new HeaderComponent(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  signupPage: async ({ page }, use) => {
    await use(new SignupPage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
});
