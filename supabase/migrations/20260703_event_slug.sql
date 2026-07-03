-- Pretty public slug for the event mini-site, e.g. /w/inbal-nadav
ALTER TABLE events ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
