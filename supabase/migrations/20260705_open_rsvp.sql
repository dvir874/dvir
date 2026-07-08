-- Open group RSVP: shareable link where guests self-register
ALTER TABLE events ADD COLUMN IF NOT EXISTS open_rsvp_token TEXT UNIQUE;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS source_group TEXT;
