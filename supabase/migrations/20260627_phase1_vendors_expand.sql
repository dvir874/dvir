-- Phase 1 Feature Expansion — wedding_vendors table expansion
-- Adds full contact info, payment tracking, and post-event ratings

ALTER TABLE wedding_vendors
  ADD COLUMN IF NOT EXISTS contact_name      TEXT,
  ADD COLUMN IF NOT EXISTS phone             TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp          TEXT,
  ADD COLUMN IF NOT EXISTS email             TEXT,
  ADD COLUMN IF NOT EXISTS address           TEXT,
  ADD COLUMN IF NOT EXISTS website           TEXT,
  ADD COLUMN IF NOT EXISTS price_agreed      NUMERIC,
  ADD COLUMN IF NOT EXISTS amount_paid       NUMERIC  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_due_date  DATE,
  ADD COLUMN IF NOT EXISTS payment_method    TEXT,
  ADD COLUMN IF NOT EXISTS payment_status    TEXT     DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS rating_quality    INT      CHECK (rating_quality BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS rating_timing     INT      CHECK (rating_timing  BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS rating_personal   INT      CHECK (rating_personal BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS rating_notes      TEXT;
