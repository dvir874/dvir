-- Add bride/groom name columns and venue name to events table
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS bride_name TEXT,
  ADD COLUMN IF NOT EXISTS groom_name TEXT,
  ADD COLUMN IF NOT EXISTS venue_name TEXT;
