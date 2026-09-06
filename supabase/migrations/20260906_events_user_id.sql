-- הקישור בין משתמש מחובר לאירוע שלו — עמודה שארבעה מסלולים כבר משתמשים בה
-- ומעולם לא נוצרה.
--
-- /api/auth/register מוסיף user_id ל-INSERT, /auth/callback מוסיף ומחפש לפיו,
-- ו-/api/auth/me מחפש לפיו. PostgREST מחזיר 400 על עמודה שלא קיימת — לא
-- מתעלם ממנה — אז ההרשמה נכשלת ב-500 אחרי שכבר נוצר משתמש ב-auth, וההתחברות
-- עם גוגל נופלת ל-error=event_failed. אף זוג לא יכול להירשם לבד היום.
--
-- nullable בכוונה: כל 7 האירועים הקיימים נוצרו ידנית ואין להם משתמש, והם
-- ממשיכים לעבוד דרך couple_token בדיוק כמו היום.

ALTER TABLE events ADD COLUMN IF NOT EXISTS user_id uuid;

COMMENT ON COLUMN events.user_id IS
  'משתמש ה-auth שנרשם לאירוע. NULL = אירוע שנוצר ידנית ע"י דביר, מזוהה דרך couple_token.';

-- החיפוש היחיד שרץ על העמודה הוא WHERE user_id = ..., בכל התחברות.
CREATE INDEX IF NOT EXISTS events_user_id_idx ON events (user_id) WHERE user_id IS NOT NULL;
