-- When Dvir was last told a wedding is missing what it needs to send.
--
-- Every report in the sender is driven by guest activity: the nightly digest
-- skips an event with no guests, and the readiness of an event is otherwise
-- checked by nobody until the day-before alert at T-1. ירון ואיילת sits 42
-- days out with no couple names, no times, no invitation image and an empty
-- guest list, and produces no signal at all.
--
-- Held per event so the alert can be weekly at a distance and daily inside two
-- weeks, without repeating every night in between.
ALTER TABLE events ADD COLUMN IF NOT EXISTS setup_alert_at timestamptz;

COMMENT ON COLUMN events.setup_alert_at IS
  'Last time an incomplete-setup alert was sent for this event. NULL = never.';
