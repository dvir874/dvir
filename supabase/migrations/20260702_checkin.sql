-- Entrance check-in: when the guest physically arrived at the venue
ALTER TABLE guests ADD COLUMN IF NOT EXISTS arrived_at TIMESTAMPTZ;
