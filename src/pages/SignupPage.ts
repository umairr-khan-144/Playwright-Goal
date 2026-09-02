import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { RegisterUserPayload } from '../types/api.types';

/**
 * "Enter Account Information" step of registration. Most fields expose a
 * proper accessible name, but the Day/Month/Year-of-birth selects and the
 * Zipcode textbox have no accessible name on the live site - those two use
 * the self-healing fallback (label attempt, then a known CSS id) instead of
 * failing outright.
 */
export class SignupPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private titleRadio(title: 'Mr' | 'Mrs') {
    return this.page.getByLabel(title === 'Mr' ? 'Mr.' : 'Mrs.');
  }

  private passwordInput() {
    return this.page.getByLabel('Password *');
  }

  private async dayOfBirthSelect() {
    return this.resolveLocator(
      [() => this.page.getByLabel(/day/i), () => this.page.locator('#days')],
      'Day of birth select',
    );
  }

  private async monthOfBirthSelect() {
    return this.resolveLocator(
      [() => this.page.getByLabel(/month/i), () => this.page.locator('#months')],
      'Month of birth select',
    );
  }

  private async yearOfBirthSelect() {
    return this.resolveLocator(
      [() => this.page.getByLabel(/year/i), () => this.page.locator('#years')],
      'Year of birth select',
    );
  }

  private newsletterCheckbox() {
    return this.page.getByLabel('Sign up for our newsletter!');
  }

  private optinCheckbox() {
    return this.page.getByLabel('Receive special offers from our partners!');
  }

  private firstNameInput() {
    return this.page.getByLabel('First name *');
  }

  private lastNameInput() {
    return this.page.getByLabel('Last name *');
  }

  private companyInput() {
    // exact match required: the Address field's accessible name also contains the word "Company".
    return this.page.getByLabel('Company', { exact: true });
  }

  private address1Input() {
    return this.page.getByRole('textbox', { name: /^Address \*/ });
  }

  private address2Input() {
    return this.page.getByLabel('Address 2');
  }

  private countrySelect() {
    return this.page.getByLabel('Country *');
  }

  private stateInput() {
    return this.page.getByLabel('State *');
  }

  private cityInput() {
    return this.page.getByRole('textbox', { name: /^City/ });
  }

  private async zipcodeInput() {
    return this.resolveLocator(
      [() => this.page.getByLabel(/zipcode/i), () => this.page.locator('#zipcode')],
      'Zipcode textbox',
    );
  }

  private mobileNumberInput() {
    return this.page.getByLabel('Mobile Number *');
  }

  private createAccountButton() {
    return this.page.getByRole('button', { name: 'Create Account' });
  }

  private accountCreatedHeading() {
    return this.page.getByText('Account Created!');
  }

  private continueButton() {
    return this.page.getByRole('link', { name: 'Continue' });
  }

  async fillAccountInformation(payload: RegisterUserPayload): Promise<void> {
    await this.titleRadio(payload.title).check();
    await this.passwordInput().fill(payload.password);
    await (await this.dayOfBirthSelect()).selectOption(payload.birth_date);
    await (await this.monthOfBirthSelect()).selectOption(payload.birth_month);
    await (await this.yearOfBirthSelect()).selectOption(payload.birth_year);
    await this.newsletterCheckbox().check();
    await this.optinCheckbox().check();
    await this.firstNameInput().fill(payload.firstname);
    await this.lastNameInput().fill(payload.lastname);
    await this.companyInput().fill(payload.company);
    await this.address1Input().fill(payload.address1);
    await this.address2Input().fill(payload.address2);
    await this.countrySelect().selectOption(payload.country);
    await this.stateInput().fill(payload.state);
    await this.cityInput().fill(payload.city);
    await (await this.zipcodeInput()).fill(payload.zipcode);
    await this.mobileNumberInput().fill(payload.mobile_number);
  }

  async submit(): Promise<void> {
    await this.createAccountButton().click();
  }

  async isAccountCreated(): Promise<boolean> {
    return this.accountCreatedHeading().isVisible();
  }

  async continueToHome(): Promise<void> {
    await this.continueButton().click();
  }
}
