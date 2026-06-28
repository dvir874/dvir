-- Link Supabase Auth users to events
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS events_user_id_idx ON events(user_id);
