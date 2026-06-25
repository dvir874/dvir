/**
 * PII Sanitizer — strips personally identifiable information before
 * it reaches external services (Sentry, structured logs).
 *
 * Rule: if in doubt, redact it.
 * Allowed outbound: UUIDs, event_ids, status codes, error messages,
 *                   stack traces, HTTP methods, route paths.
 * Blocked outbound: names, phones, emails, message content.
 */

const PII_FIELDS = new Set([
  // Person identifiers
  'name', 'full_name', 'first_name', 'last_name', 'client_name',
  'partner1_name', 'partner2_name', 'uploader_name', 'guest_name',
  // Contact details
  'phone', 'email', 'client_phone', 'client_email', 'bit_phone',
  // Message content
  'message', 'content', 'notes', 'greeting', 'body', 'text',
  // Address / location (can identify a person)
  'address', 'parking_info',
]);

/** Redact marker — visible in Sentry so we know data was intentionally stripped */
const REDACTED = '[redacted]';

/**
 * Recursively walk an object and replace PII field values with [redacted].
 * Returns a new object — never mutates the input.
 */
export function sanitize<T>(value: T, depth = 0): T {
  if (depth > 6) return value; // guard against circular / deeply nested
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item, depth + 1)) as unknown as T;
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = PII_FIELDS.has(k.toLowerCase()) ? REDACTED : sanitize(v, depth + 1);
    }
    return result as T;
  }

  return value;
}

/**
 * Sanitize a Sentry event before it is sent.
 * Strips PII from request body, extra context, and breadcrumb data.
 */
export function sanitizeSentryEvent(event: Record<string, unknown>): Record<string, unknown> {
  return sanitize(event);
}

/**
 * Sanitize a log payload.
 * Returns a new object safe to write to stdout.
 */
export function sanitizeLog(payload: Record<string, unknown>): Record<string, unknown> {
  return sanitize(payload);
}
