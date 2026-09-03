-- הרצף שאחרי החתונה: גבייה והפניה.
--
-- 04/09/2026: 779₪ מוסכמים ולא נגבו על ארבע חתונות, ואין שום דבר שגובה אותם.
-- ובמקביל — אין ערוץ לקוחות שמתחדש מעצמו. זוג מרוצה מכיר עוד זוגות שמתחתנים,
-- וזה הערוץ היחיד שגדל בלי לגעת במספר העסקי: הם לקוחות שלנו, לא זרים.
--
-- שתי חותמות, כדי שכל אחת תישלח פעם אחת בדיוק. NULL = טרם נשלח.

ALTER TABLE events ADD COLUMN IF NOT EXISTS payment_asked_at  timestamptz;
ALTER TABLE events ADD COLUMN IF NOT EXISTS referral_asked_at timestamptz;
ALTER TABLE events ADD COLUMN IF NOT EXISTS referral_code     text;

COMMENT ON COLUMN events.payment_asked_at  IS 'מתי נשלחה בקשת התשלום לזוג. NULL = טרם.';
COMMENT ON COLUMN events.referral_asked_at IS 'מתי נשלחה בקשת ההפניה. NULL = טרם.';
COMMENT ON COLUMN events.referral_code     IS 'הקוד האישי של הזוג, מתחבר ל-referral_clicks';

CREATE INDEX IF NOT EXISTS events_referral_code_idx ON events(referral_code) WHERE referral_code IS NOT NULL;
