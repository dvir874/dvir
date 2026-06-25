-- Phase 1 Feature Expansion — events table additions
-- Safe: all columns are nullable with sensible defaults

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS bit_phone            TEXT,
  ADD COLUMN IF NOT EXISTS paybox_link          TEXT,
  ADD COLUMN IF NOT EXISTS easy2give_link       TEXT,
  ADD COLUMN IF NOT EXISTS custom_gift_link     TEXT,
  ADD COLUMN IF NOT EXISTS gift_methods_enabled TEXT[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS mini_site_enabled    BOOLEAN  DEFAULT false,
  ADD COLUMN IF NOT EXISTS mini_site_hero_path  TEXT,
  ADD COLUMN IF NOT EXISTS event_timeline       JSONB    DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS service_steps        JSONB    DEFAULT '[]';
