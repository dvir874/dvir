/**
 * Basic load test against staging environment.
 * Tests: concurrent RSVPs, parallel queries, gallery reads.
 *
 * Usage: npx dotenv-cli -e .env.test -- npx tsx scripts/load-test.ts
 *
 * Requires a valid RSVP token in RSVP_TOKEN env var (or uses staging default).
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3001';
const RSVP_TOKEN = process.env.LOAD_TEST_RSVP_TOKEN ?? 'staging-rsvp-01';

interface Result {
  name: string;
  concurrency: number;
  totalRequests: number;
  successful: number;
  failed: number;
  minMs: number;
  maxMs: number;
  avgMs: number;
  p95Ms: number;
  rps: number;
}

async function timedFetch(url: string, options?: RequestInit): Promise<number> {
  const start = Date.now();
  const res = await fetch(url, options);
  const ms = Date.now() - start;
  if (!res.ok && res.status !== 429) throw new Error(`HTTP ${res.status}`);
  return ms;
}

async function runConcurrent(
  name: string,
  n: number,
  fn: () => Promise<number>,
): Promise<Result> {
  const times: number[] = [];
  let failed = 0;
  const wallStart = Date.now();

  await Promise.allSettled(
    Array.from({ length: n }).map(async () => {
      try {
        times.push(await fn());
      } catch {
        failed++;
      }
    }),
  );

  const wallMs = Date.now() - wallStart;
  times.sort((a, b) => a - b);
  const successful = times.length;

  return {
    name,
    concurrency: n,
    totalRequests: n,
    successful,
    failed,
    minMs: times[0] ?? 0,
    maxMs: times[times.length - 1] ?? 0,
    avgMs: successful > 0 ? Math.round(times.reduce((s, v) => s + v, 0) / successful) : 0,
    p95Ms: times[Math.floor(successful * 0.95)] ?? 0,
    rps: Math.round((successful / wallMs) * 1000),
  };
}

function printResult(r: Result) {
  const ok = r.failed === 0 ? '✅' : r.failed < r.totalRequests * 0.05 ? '⚠️' : '❌';
  console.log(
    `${ok} ${r.name.padEnd(35)} ` +
    `concurrent=${r.concurrency} ` +
    `ok=${r.successful} fail=${r.failed} ` +
    `avg=${r.avgMs}ms p95=${r.p95Ms}ms rps=${r.rps}`,
  );
}

async function main() {
  console.log(`\n🚀 Load test against ${BASE}\n`);

  // 1. RSVP GET — 200 concurrent
  const rsvpGet = await runConcurrent(
    'RSVP GET (200 concurrent)',
    200,
    () => timedFetch(`${BASE}/api/rsvp/${RSVP_TOKEN}`),
  );
  printResult(rsvpGet);

  // 2. Health endpoint — 100 concurrent
  const health = await runConcurrent(
    'Health check (100 concurrent)',
    100,
    () => timedFetch(`${BASE}/api/health`),
  );
  printResult(health);

  // 3. RSVP POST (status=confirmed) — 50 concurrent
  const rsvpPost = await runConcurrent(
    'RSVP POST confirmed (50 concurrent)',
    50,
    () => timedFetch(`${BASE}/api/rsvp/${RSVP_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'confirmed', guest_count: 2 }),
    }),
  );
  printResult(rsvpPost);

  // 4. Leads form POST — expect 429 after 5 from same IP
  const leadsPost = await runConcurrent(
    'Leads POST rate-limit test (20 concurrent)',
    20,
    () => timedFetch(`${BASE}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Load Test', phone: '0500000000' }),
    }),
  );
  // For this test, 429 responses count as OK (rate limiter working)
  console.log(
    `ℹ️  Leads rate-limit: ${leadsPost.successful} ok (should hit 429 for most)`
  );

  // Summary
  const allResults = [rsvpGet, health, rsvpPost, leadsPost];
  const p95Values = allResults.map(r => r.p95Ms);
  console.log(`\n📊 Summary:`);
  console.log(`   Max p95: ${Math.max(...p95Values)}ms`);
  console.log(`   Total failures: ${allResults.reduce((s, r) => s + r.failed, 0)}`);

  const maxP95 = Math.max(...p95Values);
  if (maxP95 > 3000) {
    console.log('\n⚠️  p95 > 3s — potential bottleneck, investigate DB indexes\n');
  } else {
    console.log('\n✅ All within acceptable thresholds (<3s p95)\n');
  }
}

main().catch(err => {
  console.error('Load test failed:', err);
  process.exit(1);
});
