-- Run this in Supabase SQL Editor to enable the onboarding system
-- Safe to run multiple times (IF NOT EXISTS / IF NOT EXISTS)

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS status       TEXT NOT NULL DEFAULT 'new_lead',
  ADD COLUMN IF NOT EXISTS event_type   TEXT,
  ADD COLUMN IF NOT EXISTS venue_name   TEXT,
  ADD COLUMN IF NOT EXISTS client_name  TEXT,
  ADD COLUMN IF NOT EXISTS client_phone TEXT,
  ADD COLUMN IF NOT EXISTS client_email TEXT,
  ADD COLUMN IF NOT EXISTS notes        TEXT;
