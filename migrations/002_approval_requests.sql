-- Approval requests table
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS approval_requests (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID        NOT NULL,
  version_name TEXT       NOT NULL DEFAULT 'גרסה 1',
  status      TEXT        NOT NULL DEFAULT 'pending',
  client_comment TEXT,
  approved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approval_event_id ON approval_requests(event_id);
CREATE INDEX IF NOT EXISTS idx_approval_created  ON approval_requests(created_at DESC);

-- Update EventStatus default on events table
ALTER TABLE events ALTER COLUMN status SET DEFAULT 'draft';

-- Migrate any old status values to new schema
UPDATE events SET status = 'draft'
WHERE status IN ('new_lead', 'info_received', 'guests_imported');
