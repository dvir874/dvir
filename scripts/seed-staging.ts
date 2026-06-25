/**
 * Seed script for STAGING database.
 *
 * Creates realistic fake data — no real names, phones, or emails.
 * Safe to run repeatedly (idempotent: deletes and re-inserts).
 *
 * Usage:
 *   npm run seed:staging
 *
 * Requires .env.test with STAGING Supabase credentials (NOT production).
 * Will refuse to run against the production DB URL.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load .env.test (staging credentials)
const envPath = path.resolve(process.cwd(), '.env.test');
if (!fs.existsSync(envPath)) {
  console.error('ERROR: .env.test not found. Copy .env.test.example and fill in staging credentials.');
  process.exit(1);
}
dotenv.config({ path: envPath });

const PRODUCTION_URL = 'https://vrxeqhtdwgnwsgusvywx.supabase.co';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

// Safety: refuse to seed production
if (SUPABASE_URL === PRODUCTION_URL) {
  console.error('🚨 BLOCKED: .env.test points to PRODUCTION database. Aborting.');
  console.error('   Set NEXT_PUBLIC_SUPABASE_URL to your staging Supabase project URL.');
  process.exit(1);
}

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required in .env.test');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ============================================================
// Fake data — no real PII
// ============================================================

const STAGING_EVENT_NAME = '[STAGING] Test Wedding';
const STAGING_COUPLE_TOKEN = 'staging-test-token-2026';

const FAKE_GUESTS = [
  { name: 'Test Guest 01', phone: '0500000001', guest_count: 2, status: 'confirmed', category: 'family' },
  { name: 'Test Guest 02', phone: '0500000002', guest_count: 1, status: 'confirmed', category: 'friends' },
  { name: 'Test Guest 03', phone: '0500000003', guest_count: 3, status: 'pending',   category: 'work' },
  { name: 'Test Guest 04', phone: '0500000004', guest_count: 2, status: 'declined',  category: 'family' },
  { name: 'Test Guest 05', phone: '0500000005', guest_count: 1, status: 'confirmed', category: 'friends' },
  { name: 'Test Guest 06', phone: '0500000006', guest_count: 2, status: 'pending',   category: 'family' },
  { name: 'Test Guest 07', phone: '0500000007', guest_count: 1, status: 'confirmed', category: 'friends' },
  { name: 'Test Guest 08', phone: '0500000008', guest_count: 4, status: 'confirmed', category: 'work' },
  { name: 'Test Guest 09', phone: '0500000009', guest_count: 1, status: 'pending',   category: 'friends' },
  { name: 'Test Guest 10', phone: '0500000010', guest_count: 2, status: 'confirmed', category: 'family' },
];

const FAKE_BUDGET = [
  { category: 'venue',        description: 'Test Venue',        planned_amount: 50000, actual_amount: 48000 },
  { category: 'catering',     description: 'Test Catering',     planned_amount: 80000, actual_amount: null   },
  { category: 'photography',  description: 'Test Photographer', planned_amount: 15000, actual_amount: 15000  },
  { category: 'music',        description: 'Test DJ',           planned_amount: 8000,  actual_amount: null   },
  { category: 'flowers',      description: 'Test Florist',      planned_amount: 12000, actual_amount: 11500  },
];

// ============================================================
// Main
// ============================================================

async function seed() {
  console.log(`\nSeeding staging DB: ${SUPABASE_URL}`);
  console.log('---');

  // 1. Clean up previous staging data
  console.log('Cleaning previous staging data...');
  const { data: existing } = await supabase
    .from('events')
    .select('id')
    .eq('name', STAGING_EVENT_NAME)
    .maybeSingle();

  if (existing?.id) {
    // Cascade delete will clean guests, budget, etc.
    await supabase.from('events').delete().eq('id', existing.id);
    console.log(`  Deleted previous staging event: ${existing.id}`);
  }

  // 2. Create event
  const { data: event, error: eventErr } = await supabase
    .from('events')
    .insert({
      name:                 STAGING_EVENT_NAME,
      date:                 '2027-01-01',
      address:              'Test Hall, Test City',
      couple_token:         STAGING_COUPLE_TOKEN,
      status:               'active',
      event_type:           'wedding',
      venue_name:           'Test Venue',
      client_name:          '[staging] Test Client',
      client_phone:         '0500000000',
      client_email:         'staging@test.local',
      onboarding_completed: true,
      guest_count_estimate: 150,
      budget_estimate:      200000,
    })
    .select('id')
    .single();

  if (eventErr || !event) {
    console.error('Failed to create event:', eventErr?.message);
    process.exit(1);
  }
  console.log(`  Created event: ${event.id}`);

  // 3. Create guests
  const guestRows = FAKE_GUESTS.map(g => ({
    ...g,
    event_id: event.id,
    rsvp_token: `staging-rsvp-${g.phone.slice(-2)}`,
    response_time: g.status !== 'pending' ? new Date().toISOString() : null,
  }));

  const { data: guests, error: guestsErr } = await supabase
    .from('guests')
    .insert(guestRows)
    .select('id, name');

  if (guestsErr) {
    console.error('Failed to create guests:', guestsErr.message);
    process.exit(1);
  }
  console.log(`  Created ${guests?.length ?? 0} guests`);

  // 4. Create budget items
  const budgetRows = FAKE_BUDGET.map(b => ({ ...b, event_id: event.id }));
  const { error: budgetErr } = await supabase.from('budget_items').insert(budgetRows);
  if (budgetErr) {
    console.error('Failed to create budget:', budgetErr.message);
    process.exit(1);
  }
  console.log(`  Created ${FAKE_BUDGET.length} budget items`);

  // 5. Create a seating table + assign 3 confirmed guests
  const { data: table, error: tableErr } = await supabase
    .from('seating_tables')
    .insert({ event_id: event.id, name: 'Test Table 1', capacity: 10 })
    .select('id')
    .single();

  if (!tableErr && table && guests) {
    const confirmed = guests.filter((_, i) => FAKE_GUESTS[i]?.status === 'confirmed').slice(0, 3);
    if (confirmed.length > 0) {
      await supabase.from('seating_assignments').insert(
        confirmed.map(g => ({ event_id: event.id, guest_id: g.id, table_id: table.id }))
      );
      console.log(`  Created seating table + ${confirmed.length} assignments`);
    }
  }

  // 6. Create sample gift records
  if (guests && guests.length > 0) {
    await supabase.from('gifts').insert([
      { event_id: event.id, guest_id: guests[0].id, guest_name: guests[0].name, amount: 500 },
      { event_id: event.id, guest_id: guests[1].id, guest_name: guests[1].name, amount: 1000 },
    ]);
    console.log('  Created 2 gift records');
  }

  // Summary
  console.log('\n✅ Staging seed complete!');
  console.log(`   Event ID:      ${event.id}`);
  console.log(`   Couple token:  ${STAGING_COUPLE_TOKEN}`);
  console.log(`   Guests:        ${guests?.length ?? 0}`);
  console.log(`   Budget items:  ${FAKE_BUDGET.length}`);
  console.log('\nRSVP test URL:');
  console.log(`   http://localhost:3001/rsvp/staging-rsvp-01`);
  console.log('Couple dashboard:');
  console.log(`   http://localhost:3001/couple/${STAGING_COUPLE_TOKEN}`);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
