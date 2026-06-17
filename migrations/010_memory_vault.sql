-- Migration 010: Wedding Memory Vault

-- Per-event upload tokens (public, used for QR code URLs)
-- NOTE: Also create a Supabase Storage bucket named "wedding-memories" (public read, service-role write)
CREATE TABLE IF NOT EXISTS vault_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  token      UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS vault_tokens_event_id ON vault_tokens(event_id);

-- Memory items: photos, videos, blessings uploaded by guests
CREATE TABLE IF NOT EXISTS memory_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  vault_token   UUID NOT NULL REFERENCES vault_tokens(token) ON DELETE CASCADE,
  guest_name    TEXT NOT NULL,
  guest_id      UUID REFERENCES guests(id) ON DELETE SET NULL,
  type          TEXT NOT NULL CHECK (type IN ('photo','video','blessing')),
  storage_path  TEXT,       -- Supabase Storage path (null for blessing type)
  public_url    TEXT,       -- Cached public URL
  blessing_text TEXT,       -- For type='blessing'
  file_size     BIGINT,
  mime_type     TEXT,
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS memory_items_event_id ON memory_items(event_id);
CREATE INDEX IF NOT EXISTS memory_items_token    ON memory_items(vault_token);
CREATE INDEX IF NOT EXISTS memory_items_uploaded ON memory_items(event_id, uploaded_at DESC);
