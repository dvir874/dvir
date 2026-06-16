-- Run this in the Supabase SQL editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  guest_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'declined')),
  response_time TIMESTAMPTZ,
  rsvp_token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guests_event  ON guests(event_id);
CREATE INDEX idx_guests_token  ON guests(rsvp_token);
CREATE INDEX idx_guests_status ON guests(event_id, status);
