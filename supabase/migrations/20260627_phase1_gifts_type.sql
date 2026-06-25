-- Phase 1 Feature Expansion — gifts table: add gift_type
ALTER TABLE gifts
  ADD COLUMN IF NOT EXISTS gift_type TEXT;
-- Allowed values: 'bit' | 'paybox' | 'easy2give' | 'cash' | 'check' | 'other'
