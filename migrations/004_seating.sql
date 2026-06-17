-- Migration 004: Seating arrangement system
ALTER TABLE guests ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

CREATE TABLE IF NOT EXISTS seating_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INT NOT NULL DEFAULT 10,
  type TEXT NOT NULL DEFAULT 'round', -- 'round' | 'rectangular' | 'custom'
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seating_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES seating_tables(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(guest_id)
);

CREATE INDEX IF NOT EXISTS seating_tables_event_id ON seating_tables(event_id);
CREATE INDEX IF NOT EXISTS seating_assignments_table_id ON seating_assignments(table_id);
CREATE INDEX IF NOT EXISTS seating_assignments_event_id ON seating_assignments(event_id);
