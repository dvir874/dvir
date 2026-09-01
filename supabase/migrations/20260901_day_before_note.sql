-- The couple's own line in the day-before message.
--
-- שחר asked on 01/09 to add "מומלץ להביא ביגוד חם" to the message her guests
-- get the night before: ארץ האיילים is outdoors in גוש עציון, ~950m, and a
-- September night there is cold. The message is a Meta template, so its text
-- is fixed and nothing can be appended to it — the note has to be a parameter,
-- which means a template with a slot for it and a column to hold it.
--
-- Nullable with no default on purpose. A wedding without a note keeps the
-- four-parameter template it has always used; only an event that has
-- something to say switches to the five-parameter one.
ALTER TABLE events ADD COLUMN IF NOT EXISTS day_before_note text;

COMMENT ON COLUMN events.day_before_note IS
  'One free-text line the couple wants in the day-before WhatsApp message. NULL = send the original four-parameter template.';
