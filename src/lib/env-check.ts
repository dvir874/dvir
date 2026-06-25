/**
 * Validates that all required environment variables are set in production.
 * Call this from API routes or server startup if needed.
 */

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_TOKEN',
  'ADMIN_PASSWORD',
] as const;

const RECOMMENDED_ENV_VARS = [
  'NEXT_PUBLIC_BASE_URL',
  'CRON_SECRET',
] as const;

export function validateEnv(): { ok: boolean; missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) missing.push(key);
  }

  if (process.env.NODE_ENV === 'production') {
    for (const key of RECOMMENDED_ENV_VARS) {
      if (!process.env[key]) warnings.push(key);
    }
  }

  if (missing.length > 0) {
    console.error('[env-check] CRITICAL: Missing required env vars:', missing.join(', '));
  }
  if (warnings.length > 0) {
    console.warn('[env-check] WARNING: Missing recommended env vars:', warnings.join(', '));
  }

  return { ok: missing.length === 0, missing, warnings };
}

// Run validation on module load in production
if (process.env.NODE_ENV === 'production') {
  validateEnv();
}
