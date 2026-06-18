-- Wedding Success Score snapshots (trend tracking)
CREATE TABLE IF NOT EXISTS wedding_score_snapshots (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  score      INT NOT NULL,
  components JSONB NOT NULL,
  snapped_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS wedding_score_snapshots_event_date
  ON wedding_score_snapshots(event_id, snapped_at DESC);

-- Vendor tracking
CREATE TABLE IF NOT EXISTS wedding_vendors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category    TEXT NOT NULL,
  vendor_name TEXT,
  confirmed   BOOLEAN NOT NULL DEFAULT false,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, category)
);
CREATE INDEX IF NOT EXISTS wedding_vendors_event_id ON wedding_vendors(event_id);

-- Time capsule messages
CREATE TABLE IF NOT EXISTS time_capsule_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  vault_token  UUID NOT NULL REFERENCES vault_tokens(token) ON DELETE CASCADE,
  guest_name   TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('advice','blessing','story','prediction')),
  content      TEXT NOT NULL,
  unlock_years INT NOT NULL DEFAULT 1,
  unlock_at    DATE NOT NULL,
  unlocked     BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS time_capsule_event_unlock
  ON time_capsule_messages(event_id, unlock_at);

-- Extend memory_items to support audio type
ALTER TABLE memory_items
  DROP CONSTRAINT IF EXISTS memory_items_type_check;
ALTER TABLE memory_items
  ADD CONSTRAINT memory_items_type_check
  CHECK (type IN ('photo','video','blessing','audio'));
