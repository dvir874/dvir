-- Migration 009: AI Seating Intelligence — tags, relationships

-- Multi-tag system (replaces single category column usage)
CREATE TABLE IF NOT EXISTS guest_tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id   UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  tag        TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(guest_id, tag)
);

CREATE INDEX IF NOT EXISTS guest_tags_guest_id  ON guest_tags(guest_id);
CREATE INDEX IF NOT EXISTS guest_tags_event_id  ON guest_tags(event_id);
CREATE INDEX IF NOT EXISTS guest_tags_tag        ON guest_tags(event_id, tag);

-- Relationship graph: couples must sit together, conflicts must be separated
CREATE TABLE IF NOT EXISTS guest_relationships (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_id_a   UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  guest_id_b   UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('couple','conflict','prefer_together','divorced')),
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(guest_id_a, guest_id_b)
);

CREATE INDEX IF NOT EXISTS guest_relationships_event_id ON guest_relationships(event_id);
CREATE INDEX IF NOT EXISTS guest_relationships_a        ON guest_relationships(guest_id_a);
CREATE INDEX IF NOT EXISTS guest_relationships_b        ON guest_relationships(guest_id_b);
