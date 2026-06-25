-- Performance indexes migration
-- Purpose: Add missing indexes on frequently-queried columns.
-- Safe to run multiple times (CREATE INDEX IF NOT EXISTS is idempotent).
-- Rollback: DROP INDEX <name> for each index created here.

-- ── guests ──────────────────────────────────────────────────────────────────
-- Lookup by RSVP token (RSVP page load — most frequent public query)
CREATE INDEX IF NOT EXISTS idx_guests_rsvp_token ON guests(rsvp_token);
-- Filter by event + RSVP status (dashboard table, seating)
CREATE INDEX IF NOT EXISTS idx_guests_event_id ON guests(event_id);
CREATE INDEX IF NOT EXISTS idx_guests_event_status ON guests(event_id, status);

-- ── events ──────────────────────────────────────────────────────────────────
-- Couple dashboard token lookup
CREATE INDEX IF NOT EXISTS idx_events_couple_token ON events(couple_token);

-- ── leads ───────────────────────────────────────────────────────────────────
-- CRM filtering by status
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
-- Referral tracking
CREATE INDEX IF NOT EXISTS idx_leads_ref_code ON leads(ref_code) WHERE ref_code IS NOT NULL;
-- Created at for sorting
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- ── lead_activities ──────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);

-- ── lead_tasks ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_lead_tasks_lead_id ON lead_tasks(lead_id);

-- ── gallery_photos ───────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_gallery_photos_album_id ON gallery_photos(album_id);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_event_id ON gallery_photos(event_id);

-- ── gallery_albums ───────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_gallery_albums_event_id ON gallery_albums(event_id);
CREATE INDEX IF NOT EXISTS idx_gallery_albums_public_token ON gallery_albums(public_token);

-- ── memory_items ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_memory_items_event_id ON memory_items(event_id);

-- ── vault_tokens ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_vault_tokens_token ON vault_tokens(token);
CREATE INDEX IF NOT EXISTS idx_vault_tokens_event_id ON vault_tokens(event_id);

-- ── budget_items ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_budget_items_event_id ON budget_items(event_id);

-- ── gifts ────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_gifts_event_id ON gifts(event_id);

-- ── seating_tables ───────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_seating_tables_event_id ON seating_tables(event_id);

-- ── seating_assignments ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_seating_assignments_event_id ON seating_assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_seating_assignments_guest_id ON seating_assignments(guest_id);

-- ── guest_events ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_guest_events_guest_id ON guest_events(guest_id);

-- ── whatsapp_messages ────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_event_id ON whatsapp_messages(event_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_guest_id ON whatsapp_messages(guest_id);

-- ── referral_clicks ──────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_referral_clicks_ref_code ON referral_clicks(ref_code);
