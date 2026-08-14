-- The two names that go into the invitation, separate from the event's title.
--
-- events.name is a dashboard label — "חתונת אורי ושחר" — and the generic
-- template drops {{1}} into "בעזרת ה׳ *{{1}}* מתחתנים". Using the title there
-- produces "בעזרת ה׳ חתונת אורי ושחר מתחתנים", which is what 327 of her guests
-- would have received tonight.
--
-- Nullable: an event without it falls back to stripping the known prefixes, and
-- if that does not produce something that reads like a couple the sender
-- refuses the event rather than sending the wrong text.
ALTER TABLE events ADD COLUMN IF NOT EXISTS couple_names text;

COMMENT ON COLUMN events.couple_names IS
  'שמות בני הזוג כפי שהם נכנסים להזמנה — "אורי ושחר". לא כותרת האירוע.';

UPDATE events SET couple_names = 'אורי ושחר'              WHERE date = '2026-09-08' AND couple_names IS NULL;
UPDATE events SET couple_names = 'תהל ואביב'              WHERE date = '2026-09-22' AND couple_names IS NULL;
UPDATE events SET couple_names = 'דביר בן ברוך ומירב ברון' WHERE date = '2026-08-24' AND couple_names IS NULL;
