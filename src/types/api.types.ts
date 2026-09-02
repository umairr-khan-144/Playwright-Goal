/** Payload shape accepted by the createAccount / updateAccount API endpoints and the UI signup form. */
export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
  title: 'Mr' | 'Mrs';
  birth_date: string;
  birth_month: string;
  birth_year: string;
  firstname: string;
  lastname: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  zipcode: string;
  state: string;
  city: string;
  mobile_number: string;
}

/** Common envelope returned by every automationexercise.com API endpoint. */
export interface ApiEnvelope<T = unknown> {
  responseCode: number;
  message?: string;
  [key: string]: T | number | string | undefined;
}

export interface UserDetail {
  id: number;
  name: string;
  email: string;
  title: string;
  birth_day: number;
  birth_month: number;
  birth_year: number;
  first_name: string;
  last_name: string;
  company: string;
  address1: string;
  address2: string;
  state: string;
  city: string;
  zipcode: string;
  country: string;
  mobile_number: string;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  brand: string;
  category: { usertype: { usertype: string }; category: string };
}

export interface Brand {
  id: number;
  brand: string;
}
