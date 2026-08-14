-- Holding one wedding back without touching the order of the rest.
--
-- The sender already picks the nearest wedding that still has pending guests,
-- which is the right default and was never the problem. The problem is that it
-- is the ONLY rule: there is no way to say "not this one, not tonight".
--
-- Dvir's own wedding is the nearest (24/08) and would take every run. He wants
-- מוצ״ש and Sunday to go to שחר's 327 invitations and his own 83 reminders to
-- resume on Monday. Until now that could only be done by watching the clock and
-- flipping something by hand — which is exactly the kind of thing that gets
-- forgotten at 21:00 on a Saturday night.
--
-- Nullable with no default, so every existing event is unpaused and the current
-- behaviour is unchanged. Rollback is setting it back to NULL.
ALTER TABLE events ADD COLUMN IF NOT EXISTS send_paused_until timestamptz;

COMMENT ON COLUMN events.send_paused_until IS
  'עד מתי לא לשלוח לאירוע הזה. NULL = שולחים כרגיל. לא משנה את הסדר — רק מדלג.';
