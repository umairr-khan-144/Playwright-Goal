import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/** Coerces the common "true"/"false" string forms found in .env files into a real boolean. */
const booleanFromString = () =>
  z.preprocess((value) => (typeof value === 'string' ? value.toLowerCase() === 'true' : value), z.boolean());

const envSchema = z.object({
  BASE_URL: z.string().url().default('https://automationexercise.com'),
  API_BASE_URL: z.string().url().default('https://automationexercise.com/api'),
  DEFAULT_TIMEOUT: z.coerce.number().int().positive().default(30000),
  HEADLESS: booleanFromString().default(true),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  CI: booleanFromString().default(false),
});

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast: a misconfigured environment should never silently run tests against the wrong target.
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  throw new Error('Environment validation failed. Check your .env file against .env.example.');
}

export const env: Env = parsed.data;
