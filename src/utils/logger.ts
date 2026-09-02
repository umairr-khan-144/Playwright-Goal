import winston from 'winston';
import type { APIResponse } from '@playwright/test';
import { env } from '../config/env';

const SENSITIVE_KEY_PATTERN = /password|token|authorization|secret/i;

/** Deep-clones and masks any key that looks sensitive so secrets never reach log files. */
function redact(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redact);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, val]) => [
        key,
        SENSITIVE_KEY_PATTERN.test(key) ? '***REDACTED***' : redact(val),
      ]),
    );
  }
  return value;
}

const redactFormat = winston.format((info) => {
  const { message, level, timestamp, ...meta } = info;
  return { message, level, timestamp, ...(redact(meta) as Record<string, unknown>) };
});

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    redactFormat(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
      return `[${String(timestamp)}] ${level.toUpperCase()}: ${String(message)}${metaStr}`;
    }),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'test-results/automation.log' }),
  ],
});

export function logApiRequest(method: string, url: string, payload?: Record<string, unknown>): void {
  logger.info(`API REQUEST -> ${method} ${url}`, { payload });
}

export async function logApiResponse(method: string, url: string, response: APIResponse): Promise<void> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = await response.text().catch(() => '<unreadable body>');
  }
  logger.info(`API RESPONSE <- ${method} ${url} [${response.status()}]`, { body });
}

export function logUiAction(action: string, details?: Record<string, unknown>): void {
  logger.info(`UI ACTION -> ${action}`, details);
}
