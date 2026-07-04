-- Read-only share token for parents/family status page (/status/[token])
ALTER TABLE events ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;
