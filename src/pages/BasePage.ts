import type { Locator, Page } from '@playwright/test';
import { logUiAction } from '../utils/logger';

/**
 * Base class for every Page Object. Provides navigation helpers and a
 * "self-healing" locator resolver: a prioritized list of locator strategies
 * (semantic first, CSS/id as a last resort) is tried in order until one
 * resolves to an attached element, so a single markup tweak on the app under
 * test doesn't have to break every test that touches that element.
 */
export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  protected async navigateTo(path: string): Promise<void> {
    logUiAction(`Navigate to ${path}`);
    await this.page.goto(path);
    await this.dismissOverlaysIfPresent();
  }

  /**
   * automationexercise.com serves interstitial ad overlays that can intercept
   * clicks. This best-effort cleanup keeps tests resilient to that real-world
   * flakiness source without masking genuine application failures.
   */
  protected async dismissOverlaysIfPresent(): Promise<void> {
    try {
      await this.page.keyboard.press('Escape');
    } catch {
      // no-op: not fatal if the page cannot receive the key press yet
    }
  }

  protected async resolveLocator(strategies: Array<() => Locator>, description: string): Promise<Locator> {
    let lastError: unknown;
    for (const strategy of strategies) {
      const locator = strategy();
      try {
        await locator.first().waitFor({ state: 'attached', timeout: 3000 });
        return locator;
      } catch (error) {
        lastError = error;
      }
    }
    logUiAction(`Self-healing lookup failed for "${description}"`, { error: String(lastError) });
    throw new Error(`Unable to resolve locator for "${description}" using any known strategy`);
  }
}
