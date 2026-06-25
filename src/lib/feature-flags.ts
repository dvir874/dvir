/**
 * Feature flags — controlled via environment variables.
 *
 * Toggling: change the env var in Vercel → trigger redeploy (~2 min).
 * There is no runtime hot-toggle without a redeploy; that requires a
 * DB-backed config service which is out of scope for now.
 *
 * Default: all flags are OFF unless explicitly set to "true".
 * This means a missing env var is always safe (feature disabled).
 */

function flag(name: string): boolean {
  return process.env[name] === 'true';
}

export const flags = {
  /** Send errors and exceptions to Sentry */
  sentry: flag('ENABLE_SENTRY'),

  /** Emit structured JSON logs to stdout (Vercel captures these) */
  structuredLogs: flag('ENABLE_STRUCTURED_LOGS'),

  /** Expose /api/health endpoint for uptime monitoring */
  healthEndpoint: flag('ENABLE_HEALTH_ENDPOINT'),
} as const;
