-- Row Level Security (RLS) — defense-in-depth layer.
--
-- Context: The application uses the service_role key server-side which bypasses RLS.
-- These policies protect against:
--   1. Direct anon/user-key database access (e.g., if anon key leaks)
--   2. Future client-side Supabase queries (realtime, client SDK)
--
-- Rollback per table:
--   ALTER TABLE <table> DISABLE ROW LEVEL SECURITY;
--   DROP POLICY IF EXISTS <policy_name> ON <table>;

-- ── Enable RLS on all sensitive tables ──────────────────────────────────────

ALTER TABLE events              ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests              ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE seating_tables      ENABLE ROW LEVEL SECURITY;
ALTER TABLE seating_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads               ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_tasks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_albums      ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_tokens        ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_clicks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_campaigns  ENABLE ROW LEVEL SECURITY;

-- ── Block all direct access via anon key ────────────────────────────────────
-- service_role bypasses RLS, so these policies do not affect the application.
-- They block any attempt to use the anon/public key directly.

-- events: no anon access
CREATE POLICY IF NOT EXISTS "no_anon_access" ON events
  FOR ALL TO anon USING (false);

CREATE POLICY IF NOT EXISTS "no_anon_access" ON guests
  FOR ALL TO anon USING (false);

CREATE POLICY IF NOT EXISTS "no_anon_access" ON guest_events
  FOR ALL TO anon USING (false);

CREATE POLICY IF NOT EXISTS "no_anon_access" ON budget_items
  FOR ALL TO anon USING (false);

CREATE POLICY IF NOT EXISTS "no_anon_access" ON gifts
  FOR ALL TO anon USING (false);

CREATE POLICY IF NOT EXISTS "no_anon_access" ON seating_tables
  FOR ALL TO anon USING (false);

CREATE POLICY IF NOT EXISTS "no_anon_access" ON seating_assignments
  FOR ALL TO anon USING (false);

CREATE POLICY IF NOT EXISTS "no_anon_access" ON leads
  FOR ALL TO anon USING (false);

CREATE POLICY IF NOT EXISTS "no_anon_access" ON lead_activities
  FOR ALL TO anon USING (false);

CREATE POLICY IF NOT EXISTS "no_anon_access" ON lead_tasks
  FOR ALL TO anon USING (false);

CREATE POLICY IF NOT EXISTS "no_anon_access" ON gallery_albums
  FOR ALL TO anon USING (false);

CREATE POLICY IF NOT EXISTS "no_anon_access" ON gallery_photos
  FOR ALL TO anon USING (false);

CREATE POLICY IF NOT EXISTS "no_anon_access" ON memory_items
  FOR ALL TO anon USING (false);

CREATE POLICY IF NOT EXISTS "no_anon_access" ON vault_tokens
  FOR ALL TO anon USING (false);

CREATE POLICY IF NOT EXISTS "no_anon_access" ON whatsapp_messages
  FOR ALL TO anon USING (false);

CREATE POLICY IF NOT EXISTS "no_anon_access" ON referral_clicks
  FOR ALL TO anon USING (false);

CREATE POLICY IF NOT EXISTS "no_anon_access" ON whatsapp_campaigns
  FOR ALL TO anon USING (false);
