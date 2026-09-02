import { faker } from '@faker-js/faker';
import type { RegisterUserPayload } from '../types/api.types';

/**
 * Builds a fully-populated, unique registration payload for both the UI signup
 * form and the createAccount/updateAccount API endpoints. Each call produces a
 * new unique email so parallel workers never collide on the same account.
 */
export function buildRegisterUserPayload(overrides: Partial<RegisterUserPayload> = {}): RegisterUserPayload {
  const firstname = faker.person.firstName();
  const lastname = faker.person.lastName();
  const uniqueSuffix = `${Date.now()}${faker.string.alphanumeric(6).toLowerCase()}`;

  return {
    name: `${firstname} ${lastname}`,
    email: `qa.${uniqueSuffix}@example.test`,
    password: `Qa${faker.string.alphanumeric(10)}!1`,
    title: faker.helpers.arrayElement(['Mr', 'Mrs']),
    birth_date: String(faker.number.int({ min: 1, max: 28 })),
    birth_month: String(faker.number.int({ min: 1, max: 12 })),
    birth_year: String(faker.number.int({ min: 1970, max: 2000 })),
    firstname,
    lastname,
    company: faker.company.name(),
    address1: faker.location.streetAddress(),
    address2: faker.location.secondaryAddress(),
    country: 'United States',
    zipcode: faker.location.zipCode('#####'),
    state: faker.location.state(),
    city: faker.location.city(),
    mobile_number: faker.string.numeric(10),
    ...overrides,
  };
}
