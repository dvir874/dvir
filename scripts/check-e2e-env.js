#!/usr/bin/env node
/**
 * E2E Safety Guard — run before any test suite that creates/modifies/deletes data.
 *
 * Checks:
 * 1. SUPABASE_URL must NOT be the production project.
 * 2. ADMIN_TOKEN must be set (prevents auth bypass via middleware).
 * 3. NODE_ENV must be 'test' (not 'production').
 *
 * Usage: node scripts/check-e2e-env.js
 * Or add to package.json: "pretest:e2e": "node scripts/check-e2e-env.js"
 */

const PRODUCTION_SUPABASE_URL = 'https://vrxeqhtdwgnwsgusvywx.supabase.co';

const errors = [];
const warnings = [];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const adminToken = process.env.ADMIN_TOKEN;
const nodeEnv = process.env.NODE_ENV;

// 1. Block production DB
if (!supabaseUrl) {
  errors.push('NEXT_PUBLIC_SUPABASE_URL is not set.');
} else if (supabaseUrl === PRODUCTION_SUPABASE_URL) {
  errors.push(
    `🚨 NEXT_PUBLIC_SUPABASE_URL points to PRODUCTION (${PRODUCTION_SUPABASE_URL}).\n` +
    '   E2E tests MUST use a staging/test Supabase project.\n' +
    '   Copy .env.test.example → .env.test and fill in staging credentials.'
  );
}

// 2. Require ADMIN_TOKEN (otherwise middleware bypasses auth → DELETE allowed without credentials)
if (!adminToken) {
  errors.push(
    'ADMIN_TOKEN is not set.\n' +
    '   Without it, the middleware allows DELETE/PUT on all admin routes — data can be wiped.\n' +
    '   Set ADMIN_TOKEN in .env.test.'
  );
}

// 3. Warn if not in test mode
if (nodeEnv === 'production') {
  errors.push('NODE_ENV=production — never run E2E tests in production mode.');
} else if (nodeEnv !== 'test') {
  warnings.push(`NODE_ENV is "${nodeEnv}", expected "test". Consider setting NODE_ENV=test for E2E runs.`);
}

if (warnings.length > 0) {
  console.warn('\n⚠️  E2E env warnings:');
  warnings.forEach((w) => console.warn(`   ${w}`));
}

if (errors.length > 0) {
  console.error('\n🛑 E2E safety check FAILED — tests are blocked:\n');
  errors.forEach((e) => console.error(`  ❌ ${e}\n`));
  console.error('Fix the issues above before running E2E tests.\n');
  process.exit(1);
}

console.log('✅ E2E safety check passed — staging environment confirmed.');
console.log(`   DB: ${supabaseUrl}`);
console.log(`   ADMIN_TOKEN: set ✔`);
