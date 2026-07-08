-- Guest attending the chuppah ceremony only (no meal)
ALTER TABLE guests ADD COLUMN IF NOT EXISTS chuppah_only BOOLEAN DEFAULT false;
