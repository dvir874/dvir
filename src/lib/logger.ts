/**
 * Structured logger — emits JSON lines to stdout.
 *
 * Vercel captures all stdout and makes it searchable in the dashboard.
 * JSON format enables filtering by field (e.g. event_id, module, level).
 *
 * Controlled by ENABLE_STRUCTURED_LOGS=true.
 * When disabled, falls back to console.log so dev experience is unchanged.
 *
 * Privacy: all payloads are sanitized before emission — see pii-sanitizer.ts.
 * Never log raw request bodies, guest names, phones, or email addresses.
 */

import { flags } from '@/lib/feature-flags';
import { sanitizeLog } from '@/lib/pii-sanitizer';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogPayload {
  /** Which module/route emitted this log */
  module: string;
  /** Human-readable message */
  message: string;
  /** Associated event UUID (never include event name — PII) */
  event_id?: string;
  /** Who performed the action: 'admin' | 'couple' | 'guest' | 'system' | 'cron' */
  actor?: string;
  /** HTTP status code, if relevant */
  status?: number;
  /** Arbitrary safe metadata — will be PII-sanitized */
  [key: string]: unknown;
}

function emit(level: LogLevel, payload: LogPayload): void {
  const base = {
    level,
    ts: new Date().toISOString(),
    env: process.env.NODE_ENV ?? 'development',
    ...payload,
  };

  if (flags.structuredLogs) {
    // Sanitize then emit as single-line JSON (Vercel parses this)
    const safe = sanitizeLog(base as Record<string, unknown>);
    const line = JSON.stringify(safe);
    if (level === 'error' || level === 'warn') {
      console.error(line);
    } else {
      console.log(line);
    }
  } else {
    // Dev fallback — readable format
    const { module: mod, message, ...rest } = payload;
    const extras = Object.keys(rest).length ? rest : '';
    const fn = level === 'error' ? console.error
              : level === 'warn'  ? console.warn
              : console.log;
    fn(`[${mod}] ${message}`, extras || '');
  }
}

export const logger = {
  debug: (payload: LogPayload) => emit('debug', payload),
  info:  (payload: LogPayload) => emit('info',  payload),
  warn:  (payload: LogPayload) => emit('warn',  payload),
  error: (payload: LogPayload) => emit('error', payload),
};
