-- שלוש עמודות שהקוד כתב אליהן ושלא היו קיימות.
--
-- אותה משפחת באגים של payment_status/payment_amount: הטיפוס הצהיר עליהן,
-- הטופס ב-/admin שלח אותן ב-PATCH, ורשימת ההיתר של /api/events/[id] אישרה
-- אותן — אבל ב-events הן לא היו. PostgREST עונה 42703 על העמודה הראשונה
-- שאינה מוכרת ומפיל את כל הבקשה, כך ש"קוד לבוש", "חניה" ו"ברכה" שדביר
-- מילא במסך פשוט לא נשמרו, בלי שום הודעת שגיאה שהוא ראה.
--
-- הפעם התיקון הוא ליצור אותן ולא למחוק, כי הן באמת נחוצות: דף האירוע מציג
-- אותן, והבוט עונה עליהן לאורחים — "מה ללבוש?" ו"יש חניה?" הן שתי השאלות
-- שחוזרות הכי הרבה ושעד היום נענו ב"לא הצלחנו להבין".

ALTER TABLE events ADD COLUMN IF NOT EXISTS dress_code   text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS parking_info text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS greeting     text;

COMMENT ON COLUMN events.dress_code   IS 'קוד לבוש כפי שהזוג ניסח — מוצג בדף האירוע ונענה בוואטסאפ';
COMMENT ON COLUMN events.parking_info IS 'הסבר חניה כפי שהזוג ניסח';
COMMENT ON COLUMN events.greeting     IS 'משפט פתיחה של הזוג בדף האירוע';
