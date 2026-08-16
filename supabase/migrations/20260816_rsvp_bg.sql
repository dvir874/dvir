-- The RSVP page's background, per wedding.
--
-- It was one hardcoded gradient, picked to sit under שחר's invitation: a cool
-- blue wash that echoes the green foliage on her card. תהל ואביב's invitation is
-- dried autumn leaves and warm beige, and the same blue reads as a mismatch
-- against it — the page and the card look like they belong to different events.
--
-- Nullable with no default, so every existing couple keeps exactly the gradient
-- they have today and only a filled value changes anything.
ALTER TABLE events ADD COLUMN IF NOT EXISTS rsvp_bg text;

COMMENT ON COLUMN events.rsvp_bg IS
  'רקע דף אישור ההגעה — ערך CSS מלא (linear-gradient וכו׳). NULL = ברירת המחדל.';
