-- A wedding's data, kept after the wedding is deleted.
--
-- DELETE /api/events/[id] cascades through fourteen tables and there was no
-- backup behind it. /api/admin/backup exists but is a manual export: you call
-- it with an event id and it hands you JSON. An export nobody remembers to run
-- is not a backup, and on 31/08 מירב ודביר was removed — 371 guests, 917
-- messages, and the only record of what the first wedding cost.
--
-- Written by the delete route itself, before anything is removed, so the
-- bundle exists whether or not anyone thought to ask for one.

CREATE TABLE IF NOT EXISTS deleted_event_backups (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     uuid NOT NULL,
  event_name   text,
  event_date   date,
  guest_count  integer NOT NULL DEFAULT 0,
  answered     integer NOT NULL DEFAULT 0,
  -- The whole thing: event row, guests, messages, seating. Enough to rebuild.
  bundle       jsonb NOT NULL DEFAULT '{}'::jsonb,
  deleted_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS deleted_event_backups_event_id_idx
  ON deleted_event_backups (event_id);
CREATE INDEX IF NOT EXISTS deleted_event_backups_deleted_at_idx
  ON deleted_event_backups (deleted_at DESC);
