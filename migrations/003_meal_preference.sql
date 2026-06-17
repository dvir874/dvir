-- Migration 003: Meal preferences on guests
ALTER TABLE guests ADD COLUMN IF NOT EXISTS meal_preference TEXT;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS meal_note TEXT;
