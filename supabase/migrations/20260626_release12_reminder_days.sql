-- Release 1.2 F3: Auto Reminder
-- Run manually in Supabase SQL editor
ALTER TABLE events ADD COLUMN IF NOT EXISTS reminder_days_before INT DEFAULT 7;
