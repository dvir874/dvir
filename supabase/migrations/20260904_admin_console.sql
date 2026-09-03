-- לענות לאורח מהפלאפון, בלי להיכנס לאדמין.
--
-- דביר מתחיל עבודה חדשה ורוב היום אינו מול מחשב. ההתראות כבר מגיעות לוואטסאפ
-- שלו; מה שחסר הוא הכיוון השני. אורח מבקש בן אדם ב-14:58, ההתראה מגיעה לכיס
-- תוך שניות, והמענה דרש למצוא מחשב.
--
-- הטבלה שומרת דבר אחד: על מי הייתה ההתראה האחרונה. הודעה חופשית מהפלאפון של
-- דביר נשלחת לאורח הזה — ורק אם יש כזה. בלי מצביע, טקסט חופשי אינו נשלח לאיש.

CREATE TABLE IF NOT EXISTS admin_context (
  admin_phone text PRIMARY KEY,
  guest_id    uuid REFERENCES guests(id) ON DELETE SET NULL,
  set_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  admin_context            IS 'על מי הייתה ההתראה האחרונה — היעד לתשובה חופשית מהפלאפון';
COMMENT ON COLUMN admin_context.guest_id   IS 'NULL = אין יעד, וטקסט חופשי לא יישלח לאיש';

ALTER TABLE admin_context ENABLE ROW LEVEL SECURITY;
