-- Asking the couple about guests we cannot reach.
--
-- פוריה בן שמעון's number was simply wrong. Dvir could not reach her by
-- WhatsApp, could not reach her by phone, and found out only by asking תהל —
-- who knew in one message. The couple is the only party who can tell a wrong
-- number from an unreachable one, and nothing in the system ever asked them.
--
-- Two columns rather than one: when the couple was last asked, and what they
-- were asked about. Without the second, a wedding that gains a new unreachable
-- guest a week later would be silent until the cooldown expired, and a wedding
-- whose list has not changed would be asked again for nothing.
ALTER TABLE events ADD COLUMN IF NOT EXISTS unreachable_asked_at timestamptz;
ALTER TABLE events ADD COLUMN IF NOT EXISTS unreachable_asked_ids jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN events.unreachable_asked_at IS
  'When the couple was last asked to check unreachable guests. NULL = never asked.';
COMMENT ON COLUMN events.unreachable_asked_ids IS
  'Guest ids covered by that ask, so a newly stuck guest asks again immediately.';
