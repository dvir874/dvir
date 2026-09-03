-- מתי הכסף התקבל, ולא רק כמה סוכם.
--
-- price_charged קיים מזמן ואומר מה סוכם. אין שום עמודה שאומרת אם שולם, ולדביר
-- יש מודל תשלום שבו כמעט כולם משלמים בסוף האירוע — כלומר הפער בין "סוכם"
-- ל"התקבל" הוא רוב העסק בכל רגע נתון, והוא היה קיים רק בראש שלו.
--
-- 03/09/2026: תהל שילמה 115₪ מראש. שחר (260), שלמה (320) וירון (199) סגורים
-- וממתינים לסוף האירוע. לאל וטל עדיין בלי מחיר.
--
-- nullable בכוונה: NULL = טרם שולם, וזה המצב של רוב האירועים רוב הזמן.

ALTER TABLE events ADD COLUMN IF NOT EXISTS paid_at        timestamptz;
ALTER TABLE events ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS payment_note   text;

COMMENT ON COLUMN events.paid_at        IS 'מתי התקבל התשלום בפועל. NULL = טרם שולם.';
COMMENT ON COLUMN events.payment_method IS 'ביט / העברה / מזומן / אחר';
COMMENT ON COLUMN events.payment_note   IS 'הערה חופשית — תשלום חלקי, הנחה, סיכום מיוחד';

-- תהל שילמה. שאר האירועים נשארים NULL, שזה בדיוק המשמעות של "בסוף האירוע".
UPDATE events SET paid_at = '2026-09-03T00:00:00Z', payment_note = 'שולם מראש · מחיר עלות'
WHERE id = '2aa58430-c13d-4fc9-aad2-867a680a8739' AND paid_at IS NULL;

-- שאילתה למי שחייב כסף, לפי סדר האירועים שכבר עברו:
--   SELECT name, date, price_charged FROM events
--   WHERE paid_at IS NULL AND price_charged IS NOT NULL AND date < CURRENT_DATE
--   ORDER BY date;
